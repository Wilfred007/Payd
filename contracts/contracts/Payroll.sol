// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract Payroll is Ownable, ReentrancyGuard {
    IERC20 public immutable stable; // e.g., cUSD

    enum Interval {
        Weekly,
        BiWeekly,
        Monthly
    }

    struct Employee {
        address wallet;
        uint256 salary; // in token smallest units (e.g., 1 cUSD = 1e18)
        Interval interval;
        uint256 nextPayday; // unix timestamp
        bool active;
        bool exists;
    }

    mapping(address => Employee) private employees;
    address[] private employeeIndex; // for iteration

    event EmployeeAdded(address indexed wallet, uint256 salary, Interval interval, uint256 nextPayday);
    event EmployeeUpdated(address indexed wallet, uint256 salary, Interval interval, uint256 nextPayday);
    event EmployeeRemoved(address indexed wallet);
    event PayrollPaid(address indexed wallet, uint256 amount, uint256 timestamp, bytes32 txRef);

    constructor(address _stable) Ownable(msg.sender) {
        require(_stable != address(0), "stable token required");
        stable = IERC20(_stable);
    }

    function addEmployee(
        address wallet,
        uint256 salary,
        Interval interval,
        uint256 firstPayday
    ) external onlyOwner {
        require(wallet != address(0), "wallet required");
        require(!employees[wallet].exists, "exists");
        require(salary > 0, "salary>0");
        require(firstPayday >= block.timestamp, "future payday");

        employees[wallet] = Employee({
            wallet: wallet,
            salary: salary,
            interval: interval,
            nextPayday: firstPayday,
            active: true,
            exists: true
        });
        employeeIndex.push(wallet);
        emit EmployeeAdded(wallet, salary, interval, firstPayday);
    }

    function updateEmployee(
        address wallet,
        uint256 salary,
        Interval interval
    ) external onlyOwner {
        Employee storage e = employees[wallet];
        require(e.exists, "not found");
        require(salary > 0, "salary>0");
        e.salary = salary;
        e.interval = interval;
        emit EmployeeUpdated(wallet, e.salary, e.interval, e.nextPayday);
    }

    function updateEmployeeWallet(address oldWallet, address newWallet) external onlyOwner {
        require(newWallet != address(0), "new wallet");
        Employee storage e = employees[oldWallet];
        require(e.exists, "not found");
        require(!employees[newWallet].exists, "new exists");

        // move record
        employees[newWallet] = Employee({
            wallet: newWallet,
            salary: e.salary,
            interval: e.interval,
            nextPayday: e.nextPayday,
            active: e.active,
            exists: true
        });
        delete employees[oldWallet];
        // update index array entry
        for (uint256 i = 0; i < employeeIndex.length; i++) {
            if (employeeIndex[i] == oldWallet) {
                employeeIndex[i] = newWallet;
                break;
            }
        }
        emit EmployeeUpdated(newWallet, employees[newWallet].salary, employees[newWallet].interval, employees[newWallet].nextPayday);
    }

    function removeEmployee(address wallet) external onlyOwner {
        Employee storage e = employees[wallet];
        require(e.exists, "not found");
        e.active = false;
        emit EmployeeRemoved(wallet);
    }

    function setNextPayday(address wallet, uint256 nextPayday) external onlyOwner {
        Employee storage e = employees[wallet];
        require(e.exists, "not found");
        require(nextPayday >= block.timestamp, "past");
        e.nextPayday = nextPayday;
        emit EmployeeUpdated(wallet, e.salary, e.interval, e.nextPayday);
    }

    function getEmployee(address wallet)
        external
        view
        returns (address, uint256, Interval, uint256, bool)
    {
        Employee memory e = employees[wallet];
        require(e.exists, "not found");
        return (e.wallet, e.salary, e.interval, e.nextPayday, e.active);
    }

    function getEmployees(uint256 offset, uint256 limit)
        external
        view
        returns (address[] memory)
    {
        uint256 n = employeeIndex.length;
        if (offset >= n) {
            return new address[](0);
        }
        uint256 end = offset + limit;
        if (end > n) end = n;
        uint256 size = end - offset;
        address[] memory slice = new address[](size);
        for (uint256 i = 0; i < size; i++) {
            slice[i] = employeeIndex[offset + i];
        }
        return slice;
    }

    function intervalToSeconds(Interval interval) public pure returns (uint256) {
        if (interval == Interval.Weekly) return 7 days;
        if (interval == Interval.BiWeekly) return 14 days;
        return 30 days; // Monthly (approx)
    }

    function tokenBalance() public view returns (uint256) {
        return stable.balanceOf(address(this));
    }

    function deposit(uint256 amount) external nonReentrant {
        require(amount > 0, "amount>0");
        // Employer must have approved this contract for amount
        bool ok = stable.transferFrom(msg.sender, address(this), amount);
        require(ok, "transferFrom failed");
    }

    function runPayroll(uint256 maxCount) external nonReentrant onlyOwner returns (uint256 processed, uint256 totalPaid) {
        require(maxCount > 0, "maxCount>0");
        uint256 n = employeeIndex.length;
        uint256 paidCount = 0;
        uint256 sumPaid = 0;
        for (uint256 i = 0; i < n && paidCount < maxCount; i++) {
            address wallet = employeeIndex[i];
            Employee storage e = employees[wallet];
            if (!e.exists || !e.active) continue;
            if (block.timestamp < e.nextPayday) continue;
            if (stable.balanceOf(address(this)) < e.salary) {
                // stop if insufficient balance to avoid partial transfer reverts
                break;
            }
            bool ok = stable.transfer(e.wallet, e.salary);
            require(ok, "payout transfer failed");
            e.nextPayday = e.nextPayday + intervalToSeconds(e.interval);
            paidCount += 1;
            sumPaid += e.salary;
            emit PayrollPaid(e.wallet, e.salary, block.timestamp, keccak256(abi.encodePacked(blockhash(block.number - 1), e.wallet, block.timestamp)));
        }
        return (paidCount, sumPaid);
    }
}
