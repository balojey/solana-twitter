import {
  PublicKey,
  Connection,
  TransactionInstruction,
  SystemProgram,
  AccountInfo
} from '@solana/web3.js';
import { sha256 } from 'js-sha256';
import bs58 from 'bs58';
import { Buffer } from 'buffer';

// Program ID
export const PROGRAM_ID = new PublicKey('5S7sfpY15KPmL5SfQ3PM81mzeoig8uXWtdwEL2sLq67X');

// Utility to compute discriminators
function getDiscriminator(name: string, type: 'account' | 'global'): Buffer {
  return Buffer.from(sha256.digest(`${type}:${name}`)).subarray(0, 8);
}

// Instruction discriminators
const INSTRUCTION_DISCRIMINATORS = {
  createOrUpdateProfile: getDiscriminator('create_or_update_profile', 'global'),
  postTweet: getDiscriminator('post_tweet', 'global'),
  likeTweet: getDiscriminator('like_tweet', 'global'),
  unlikeTweet: getDiscriminator('unlike_tweet', 'global'),
  followUser: getDiscriminator('follow_user', 'global'),
  unfollowUser: getDiscriminator('unfollow_user', 'global'),
  retweet: getDiscriminator('retweet', 'global'),
  bookmarkTweet: getDiscriminator('bookmark_tweet', 'global'),
  unbookmarkTweet: getDiscriminator('unbookmark_tweet', 'global')
};

// Account discriminators
const ACCOUNT_DISCRIMINATORS = {
  userProfile: getDiscriminator('UserProfile', 'account'),
  tweet: getDiscriminator('Tweet', 'account'),
  like: getDiscriminator('Like', 'account'),
  follow: getDiscriminator('Follow', 'account'),
  retweet: getDiscriminator('Retweet', 'account'),
  bookmark: getDiscriminator('Bookmark', 'account')
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
  return PublicKey.findProgramAddressSync([
    Buffer.from('profile'),
    authority.toBuffer()
  ], PROGRAM_ID);
}

export async function deriveTweetPDA(authority: PublicKey, timestamp: number): Promise<[PublicKey, number]> {
  return PublicKey.findProgramAddressSync([
    Buffer.from('tweet'),
    authority.toBuffer(),
    encodeI64(timestamp)
  ], PROGRAM_ID);
}

export async function deriveLikePDA(user: PublicKey, tweet: PublicKey): Promise<[PublicKey, number]> {
  return PublicKey.findProgramAddressSync([
    Buffer.from('like'),
    user.toBuffer(),
    tweet.toBuffer()
  ], PROGRAM_ID);
}

export async function deriveFollowPDA(follower: PublicKey, following: PublicKey): Promise<[PublicKey, number]> {
  return PublicKey.findProgramAddressSync([
    Buffer.from('follow'),
    follower.toBuffer(),
    following.toBuffer()
  ], PROGRAM_ID);
}

export async function deriveRetweetPDA(user: PublicKey, tweet: PublicKey): Promise<[PublicKey, number]> {
  return PublicKey.findProgramAddressSync([
    Buffer.from('retweet'),
    user.toBuffer(),
    tweet.toBuffer()
  ], PROGRAM_ID);
}

export async function deriveBookmarkPDA(user: PublicKey, tweet: PublicKey): Promise<[PublicKey, number]> {
  return PublicKey.findProgramAddressSync([
    Buffer.from('bookmark'),
    user.toBuffer(),
    tweet.toBuffer()
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

export function likeTweetInstruction(
  like: PublicKey,
  user: PublicKey,
  tweet: PublicKey
): TransactionInstruction {
  const data = Buffer.concat([
    INSTRUCTION_DISCRIMINATORS.likeTweet
  ]);

  return new TransactionInstruction({
    keys: [
      { pubkey: like, isSigner: false, isWritable: true },
      { pubkey: user, isSigner: true, isWritable: true },
      { pubkey: tweet, isSigner: false, isWritable: false },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false }
    ],
    programId: PROGRAM_ID,
    data
  });
}

export function unlikeTweetInstruction(
  like: PublicKey,
  user: PublicKey,
  tweet: PublicKey
): TransactionInstruction {
  const data = Buffer.concat([
    INSTRUCTION_DISCRIMINATORS.unlikeTweet
  ]);

  return new TransactionInstruction({
    keys: [
      { pubkey: like, isSigner: false, isWritable: true },
      { pubkey: user, isSigner: true, isWritable: true },
      { pubkey: tweet, isSigner: false, isWritable: false },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false }
    ],
    programId: PROGRAM_ID,
    data
  });
}

export function followUserInstruction(
  follow: PublicKey,
  follower: PublicKey,
  following: PublicKey
): TransactionInstruction {
  const data = Buffer.concat([
    INSTRUCTION_DISCRIMINATORS.followUser
  ]);

  return new TransactionInstruction({
    keys: [
      { pubkey: follow, isSigner: false, isWritable: true },
      { pubkey: follower, isSigner: true, isWritable: true },
      { pubkey: following, isSigner: false, isWritable: false },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false }
    ],
    programId: PROGRAM_ID,
    data
  });
}

export function unfollowUserInstruction(
  follow: PublicKey,
  follower: PublicKey,
  following: PublicKey
): TransactionInstruction {
  const data = Buffer.concat([
    INSTRUCTION_DISCRIMINATORS.unfollowUser
  ]);

  return new TransactionInstruction({
    keys: [
      { pubkey: follow, isSigner: false, isWritable: true },
      { pubkey: follower, isSigner: true, isWritable: true },
      { pubkey: following, isSigner: false, isWritable: false },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false }
    ],
    programId: PROGRAM_ID,
    data
  });
}

export function retweetInstruction(
  retweet: PublicKey,
  user: PublicKey,
  originalTweet: PublicKey,
  timestamp: number
): TransactionInstruction {
  const data = Buffer.concat([
    INSTRUCTION_DISCRIMINATORS.retweet,
    encodeI64(timestamp)
  ]);

  return new TransactionInstruction({
    keys: [
      { pubkey: retweet, isSigner: false, isWritable: true },
      { pubkey: user, isSigner: true, isWritable: true },
      { pubkey: originalTweet, isSigner: false, isWritable: false },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false }
    ],
    programId: PROGRAM_ID,
    data
  });
}

export function bookmarkTweetInstruction(
  bookmark: PublicKey,
  user: PublicKey,
  tweet: PublicKey
): TransactionInstruction {
  const data = Buffer.concat([
    INSTRUCTION_DISCRIMINATORS.bookmarkTweet
  ]);

  return new TransactionInstruction({
    keys: [
      { pubkey: bookmark, isSigner: false, isWritable: true },
      { pubkey: user, isSigner: true, isWritable: true },
      { pubkey: tweet, isSigner: false, isWritable: false },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false }
    ],
    programId: PROGRAM_ID,
    data
  });
}

export function unbookmarkTweetInstruction(
  bookmark: PublicKey,
  user: PublicKey,
  tweet: PublicKey
): TransactionInstruction {
  const data = Buffer.concat([
    INSTRUCTION_DISCRIMINATORS.unbookmarkTweet
  ]);

  return new TransactionInstruction({
    keys: [
      { pubkey: bookmark, isSigner: false, isWritable: true },
      { pubkey: user, isSigner: true, isWritable: true },
      { pubkey: tweet, isSigner: false, isWritable: false },
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

export interface Like {
  user: PublicKey;
  tweet: PublicKey;
}

export interface Follow {
  follower: PublicKey;
  following: PublicKey;
}

export interface Retweet {
  user: PublicKey;
  originalTweet: PublicKey;
  timestamp: number;
}

export interface Bookmark {
  user: PublicKey;
  tweet: PublicKey;
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

export function decodeLike(accountInfo: AccountInfo<Buffer>): Like {
  const data = accountInfo.data;
  let offset = 8;
  const { value: user, newOffset: o1 } = decodePublicKey(data, offset);
  const { value: tweet } = decodePublicKey(data, o1);
  return { user, tweet };
}

export function decodeFollow(accountInfo: AccountInfo<Buffer>): Follow {
  const data = accountInfo.data;
  let offset = 8;
  const { value: follower, newOffset: o1 } = decodePublicKey(data, offset);
  const { value: following } = decodePublicKey(data, o1);
  return { follower, following };
}

export function decodeRetweet(accountInfo: AccountInfo<Buffer>): Retweet {
  const data = accountInfo.data;
  let offset = 8;
  const { value: user, newOffset: o1 } = decodePublicKey(data, offset);
  const { value: originalTweet, newOffset: o2 } = decodePublicKey(data, o1);
  const { value: timestamp } = decodeI64(data, o2);
  return { user, originalTweet, timestamp };
}

export function decodeBookmark(accountInfo: AccountInfo<Buffer>): Bookmark {
  const data = accountInfo.data;
  let offset = 8;
  const { value: user, newOffset: o1 } = decodePublicKey(data, offset);
  const { value: tweet } = decodePublicKey(data, o1);
  return { user, tweet };
}

// Discriminator-based type checks
export function isUserProfileAccount(accountInfo: AccountInfo<Buffer>): boolean {
  return accountInfo.data.subarray(0, 8).equals(ACCOUNT_DISCRIMINATORS.userProfile);
}

export function isTweetAccount(accountInfo: AccountInfo<Buffer>): boolean {
  return accountInfo.data.subarray(0, 8).equals(ACCOUNT_DISCRIMINATORS.tweet);
}

export function isLikeAccount(accountInfo: AccountInfo<Buffer>): boolean {
  return accountInfo.data.subarray(0, 8).equals(ACCOUNT_DISCRIMINATORS.like);
}

export function isFollowAccount(accountInfo: AccountInfo<Buffer>): boolean {
  return accountInfo.data.subarray(0, 8).equals(ACCOUNT_DISCRIMINATORS.follow);
}

export function isRetweetAccount(accountInfo: AccountInfo<Buffer>): boolean {
  return accountInfo.data.subarray(0, 8).equals(ACCOUNT_DISCRIMINATORS.retweet);
}

export function isBookmarkAccount(accountInfo: AccountInfo<Buffer>): boolean {
  return accountInfo.data.subarray(0, 8).equals(ACCOUNT_DISCRIMINATORS.bookmark);
}

// Fetch all program accounts by type
export async function getAllProgramAccounts(
  connection: Connection,
  accountType: 'userProfile' | 'tweet' | 'like' | 'follow' | 'retweet' | 'bookmark'
): Promise<Array<{ pubkey: PublicKey; account: AccountInfo<Buffer> }>> {
  const discriminatorMap = {
    userProfile: ACCOUNT_DISCRIMINATORS.userProfile,
    tweet: ACCOUNT_DISCRIMINATORS.tweet,
    like: ACCOUNT_DISCRIMINATORS.like,
    follow: ACCOUNT_DISCRIMINATORS.follow,
    retweet: ACCOUNT_DISCRIMINATORS.retweet,
    bookmark: ACCOUNT_DISCRIMINATORS.bookmark
  };

  const discriminator = discriminatorMap[accountType];

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