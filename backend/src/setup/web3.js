import { ethers } from 'ethers';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const provider = new ethers.JsonRpcProvider(process.env.ALPHAJORES_RPC_URL || process.env.ALFAJORES_RPC_URL || 'https://alfajores-forno.celo-testnet.org');
const wallet = process.env.PRIVATE_KEY ? new ethers.Wallet(process.env.PRIVATE_KEY, provider) : null;

const STABLE_TOKEN_ADDRESS = process.env.STABLE_TOKEN_ADDRESS || '0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1';
const ERC20_ABI = [
  'function balanceOf(address) view returns (uint256)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function approve(address spender, uint256 amount) returns (bool)'
];

function getPayrollAbi() {
  const abiPath = path.resolve(process.cwd(), 'backend/src/abi/Payroll.json');
  const raw = fs.readFileSync(abiPath, 'utf-8');
  return JSON.parse(raw);
}

export async function getPayrollContract(address) {
  const abi = getPayrollAbi();
  if (!wallet) throw new Error('Missing PRIVATE_KEY for transactions');
  return new ethers.Contract(address, abi, wallet);
}

export async function getTokenBalance(address) {
  const erc20 = new ethers.Contract(STABLE_TOKEN_ADDRESS, ERC20_ABI, provider);
  const bal = await erc20.balanceOf(address);
  return bal.toString();
}
