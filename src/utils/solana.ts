import {
  PublicKey,
  Connection,
  TransactionInstruction,
  SystemProgram,
  AccountInfo
} from '@solana/web3.js';
import { sha256 } from 'js-sha256';
import bs58 from 'bs58';

// Program ID
export const PROGRAM_ID = new PublicKey('5S7sfpY15KPmL5SfQ3PM81mzeoig8uXWtdwEL2sLq67X');

// Utility to compute discriminators
function getDiscriminator(name: string, type: 'account' | 'global'): Buffer {
  return Buffer.from(sha256.digest(`${type}:${name}`)).subarray(0, 8);
}

// Instruction discriminators
const INSTRUCTION_DISCRIMINATORS = {
  createOrUpdateProfile: getDiscriminator('createOrUpdateProfile', 'global'),
  postTweet: getDiscriminator('postTweet', 'global')
};

// Account discriminators
const ACCOUNT_DISCRIMINATORS = {
  userProfile: getDiscriminator('UserProfile', 'account'),
  tweet: getDiscriminator('Tweet', 'account')
};

// Utility encoders/decoders
export function encodeString(str: string): Buffer {
  const strBuffer = Buffer.from(str, 'utf8');
  const lengthBuffer = Buffer.alloc(4);
  lengthBuffer.writeUInt32LE(strBuffer.length, 0);
  return Buffer.concat([lengthBuffer, strBuffer]);
}

export function decodeString(buffer: Buffer, offset: number): { value: string; newOffset: number } {
  const length = buffer.readUInt32LE(offset);
  const value = buffer.subarray(offset + 4, offset + 4 + length).toString('utf8');
  return { value, newOffset: offset + 4 + length };
}

export function encodeI64(value: number): Buffer {
  const buffer = Buffer.alloc(8);
  const low = value & 0xffffffff;
  const high = Math.floor(value / 0x100000000);
  buffer.writeUInt32LE(low, 0);
  buffer.writeUInt32LE(high, 4);
  return buffer;
}

export function decodeI64(buffer: Buffer, offset: number): { value: number; newOffset: number } {
  const low = buffer.readUInt32LE(offset);
  const high = buffer.readUInt32LE(offset + 4);
  const value = high * 0x100000000 + low;
  return { value, newOffset: offset + 8 };
}

export function encodePublicKey(pubkey: PublicKey): Buffer {
  return pubkey.toBuffer();
}

export function decodePublicKey(buffer: Buffer, offset: number): { value: PublicKey; newOffset: number } {
  const pubkeyBuffer = buffer.subarray(offset, offset + 32);
  const value = new PublicKey(pubkeyBuffer);
  return { value, newOffset: offset + 32 };
}

export function encodeOption<T>(value: T | null, encoder: (val: T) => Buffer): Buffer {
  return value === null ? Buffer.from([0]) : Buffer.concat([Buffer.from([1]), encoder(value)]);
}

export function decodeOption<T>(
  buffer: Buffer,
  offset: number,
  decoder: (buf: Buffer, off: number) => { value: T; newOffset: number }
): { value: T | null; newOffset: number } {
  const hasValue = buffer.readUInt8(offset);
  if (hasValue === 0) return { value: null, newOffset: offset + 1 };
  const decoded = decoder(buffer, offset + 1);
  return { value: decoded.value, newOffset: decoded.newOffset };
}

// PDA derivation
export async function deriveProfilePDA(authority: PublicKey): Promise<[PublicKey, number]> {
  return PublicKey.findProgramAddress([
    Buffer.from('profile'),
    authority.toBuffer()
  ], PROGRAM_ID);
}

export async function deriveTweetPDA(authority: PublicKey, timestamp: number): Promise<[PublicKey, number]> {
  return PublicKey.findProgramAddress([
    Buffer.from('tweet'),
    authority.toBuffer(),
    encodeI64(timestamp)
  ], PROGRAM_ID);
}

// Instruction builders
export function createOrUpdateProfileInstruction(
  profile: PublicKey,
  authority: PublicKey,
  username: string,
  bio: string
): TransactionInstruction {
  const data = Buffer.concat([
    INSTRUCTION_DISCRIMINATORS.createOrUpdateProfile,
    encodeString(username),
    encodeString(bio)
  ]);

  return new TransactionInstruction({
    keys: [
      { pubkey: profile, isSigner: false, isWritable: true },
      { pubkey: authority, isSigner: true, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false }
    ],
    programId: PROGRAM_ID,
    data
  });
}

export function postTweetInstruction(
  tweet: PublicKey,
  authority: PublicKey,
  content: string,
  timestamp: number,
  parent: PublicKey | null
): TransactionInstruction {
  const data = Buffer.concat([
    INSTRUCTION_DISCRIMINATORS.postTweet,
    encodeString(content),
    encodeI64(timestamp),
    encodeOption(parent, encodePublicKey)
  ]);

  return new TransactionInstruction({
    keys: [
      { pubkey: tweet, isSigner: false, isWritable: true },
      { pubkey: authority, isSigner: true, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false }
    ],
    programId: PROGRAM_ID,
    data
  });
}

// Account types and decoders
export interface UserProfile {
  authority: PublicKey;
  username: string;
  bio: string;
}

export interface Tweet {
  authority: PublicKey;
  content: string;
  timestamp: number;
  parent: PublicKey | null;
}

export function decodeUserProfile(accountInfo: AccountInfo<Buffer>): UserProfile {
  const data = accountInfo.data;
  let offset = 8;
  const { value: authority, newOffset: o1 } = decodePublicKey(data, offset);
  const { value: username, newOffset: o2 } = decodeString(data, o1);
  const { value: bio } = decodeString(data, o2);
  return { authority, username, bio };
}

export function decodeTweet(accountInfo: AccountInfo<Buffer>): Tweet {
  const data = accountInfo.data;
  let offset = 8;
  const { value: authority, newOffset: o1 } = decodePublicKey(data, offset);
  const { value: content, newOffset: o2 } = decodeString(data, o1);
  const { value: timestamp, newOffset: o3 } = decodeI64(data, o2);
  const { value: parent } = decodeOption(data, o3, decodePublicKey);
  return { authority, content, timestamp, parent };
}

// Discriminator-based type checks
export function isUserProfileAccount(accountInfo: AccountInfo<Buffer>): boolean {
  return accountInfo.data.subarray(0, 8).equals(ACCOUNT_DISCRIMINATORS.userProfile);
}

export function isTweetAccount(accountInfo: AccountInfo<Buffer>): boolean {
  return accountInfo.data.subarray(0, 8).equals(ACCOUNT_DISCRIMINATORS.tweet);
}

// Fetch all program accounts by type
export async function getAllProgramAccounts(
  connection: Connection,
  accountType: 'userProfile' | 'tweet'
): Promise<Array<{ pubkey: PublicKey; account: AccountInfo<Buffer> }>> {
  const discriminator = accountType === 'userProfile'
    ? ACCOUNT_DISCRIMINATORS.userProfile
    : ACCOUNT_DISCRIMINATORS.tweet;

  const accounts = await connection.getProgramAccounts(PROGRAM_ID, {
    filters: [
      {
        memcmp: {
          offset: 0,
          bytes: bs58.encode(discriminator)
        }
      }
    ]
  });

  return accounts.map(acc => ({
    pubkey: acc.pubkey,
    account: acc.account
  }));
}

