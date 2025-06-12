import { 
  PublicKey, 
  Connection, 
  Transaction, 
  TransactionInstruction,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  AccountInfo
} from '@solana/web3.js';

// Program ID
export const PROGRAM_ID = new PublicKey('5S7sfpY15KPmL5SfQ3PM81mzeoig8uXWtdwEL2sLq67X');

// Instruction discriminators (first 8 bytes of instruction data)
const INSTRUCTION_DISCRIMINATORS = {
  createOrUpdateProfile: Buffer.from([0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]),
  postTweet: Buffer.from([0x02, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00])
};

// Account discriminators (first 8 bytes of account data)
const ACCOUNT_DISCRIMINATORS = {
  userProfile: Buffer.from([0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]),
  tweet: Buffer.from([0x02, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00])
};

// Utility functions for encoding/decoding
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
  // Handle large numbers by splitting into high and low 32-bit parts
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
  if (value === null) {
    return Buffer.from([0]); // None variant
  } else {
    return Buffer.concat([Buffer.from([1]), encoder(value)]); // Some variant
  }
}

export function decodeOption<T>(
  buffer: Buffer, 
  offset: number, 
  decoder: (buf: Buffer, off: number) => { value: T; newOffset: number }
): { value: T | null; newOffset: number } {
  const hasValue = buffer.readUInt8(offset);
  if (hasValue === 0) {
    return { value: null, newOffset: offset + 1 };
  } else {
    const decoded = decoder(buffer, offset + 1);
    return { value: decoded.value, newOffset: decoded.newOffset };
  }
}

// PDA derivation functions
export async function deriveProfilePDA(authority: PublicKey): Promise<[PublicKey, number]> {
  return PublicKey.findProgramAddress(
    [Buffer.from('profile'), authority.toBuffer()],
    PROGRAM_ID
  );
}

export async function deriveTweetPDA(authority: PublicKey, timestamp: number): Promise<[PublicKey, number]> {
  const timestampBuffer = encodeI64(timestamp);
  return PublicKey.findProgramAddress(
    [Buffer.from('tweet'), authority.toBuffer(), timestampBuffer],
    PROGRAM_ID
  );
}

// Instruction builders
export function createOrUpdateProfileInstruction(
  profile: PublicKey,
  authority: PublicKey,
  username: string,
  bio: string
): TransactionInstruction {
  const usernameBuffer = encodeString(username);
  const bioBuffer = encodeString(bio);
  
  const data = Buffer.concat([
    INSTRUCTION_DISCRIMINATORS.createOrUpdateProfile,
    usernameBuffer,
    bioBuffer
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
  const contentBuffer = encodeString(content);
  const timestampBuffer = encodeI64(timestamp);
  const parentBuffer = encodeOption(parent, encodePublicKey);
  
  const data = Buffer.concat([
    INSTRUCTION_DISCRIMINATORS.postTweet,
    contentBuffer,
    timestampBuffer,
    parentBuffer
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

// Account decoders
export interface UserProfile {
  authority: PublicKey;
  username: string;
  bio: string;
  createdAt: number;
}

export interface Tweet {
  authority: PublicKey;
  content: string;
  timestamp: number;
  parent: PublicKey | null;
}

export function decodeUserProfile(accountInfo: AccountInfo<Buffer>): UserProfile {
  const data = accountInfo.data;
  
  // Skip discriminator (first 8 bytes)
  let offset = 8;
  
  const { value: authority, newOffset: offset1 } = decodePublicKey(data, offset);
  const { value: username, newOffset: offset2 } = decodeString(data, offset1);
  const { value: bio, newOffset: offset3 } = decodeString(data, offset2);
  const { value: createdAt } = decodeI64(data, offset3);
  
  return {
    authority,
    username,
    bio,
    createdAt
  };
}

export function decodeTweet(accountInfo: AccountInfo<Buffer>): Tweet {
  const data = accountInfo.data;
  
  // Skip discriminator (first 8 bytes)
  let offset = 8;
  
  const { value: authority, newOffset: offset1 } = decodePublicKey(data, offset);
  const { value: content, newOffset: offset2 } = decodeString(data, offset1);
  const { value: timestamp, newOffset: offset3 } = decodeI64(data, offset2);
  const { value: parent } = decodeOption(data, offset3, decodePublicKey);
  
  return {
    authority,
    content,
    timestamp,
    parent
  };
}

// Helper function to check if account data matches expected discriminator
export function isUserProfileAccount(accountInfo: AccountInfo<Buffer>): boolean {
  if (accountInfo.data.length < 8) return false;
  return accountInfo.data.subarray(0, 8).equals(ACCOUNT_DISCRIMINATORS.userProfile);
}

export function isTweetAccount(accountInfo: AccountInfo<Buffer>): boolean {
  if (accountInfo.data.length < 8) return false;
  return accountInfo.data.subarray(0, 8).equals(ACCOUNT_DISCRIMINATORS.tweet);
}

// Helper to get all program accounts of a specific type
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
          bytes: discriminator.toString('base64')
        }
      }
    ]
  });

  return accounts;
}