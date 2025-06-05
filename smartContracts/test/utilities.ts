import { Address, Addresses, NullNoPromise, StrBigHex, } from "./types";
import { ethers, Web3 } from "hardhat";
import BigNumber from "bignumber.js";
import { Hex, parseEther } from "viem";
import { expect } from "chai";

export const locker = { LOCKED: "LOCKED", UNLOCKED: "UNLOCKED" };
export enum FuncTag { JOIN, GET, PAYBACK, CANCELED, ENDED };
export enum Status { AVAILABLE, TAKEN };
export enum Router { NONE, PERMISSIONLESS, PERMISSIONED }
export const bigintToStr = (x:bigint) => x.toString();
export const toHex = (x: any) => Web3.utils.numberToHex(x);
export const buildstring = (affx: string, start: string, times: number) => `${affx}${`${start}`.repeat(times)}`;
export const formatAddr = (x: string | (Address | undefined)) : Address => {
  if(!x || x === "") return `0x${'0'.repeat(40)}`;
  return `0x${x.substring(2, 42)}`;
};

export const convertStringsToAddresses = (args: string[]) => {
  let returnArr : Addresses = []; 
  for(let i = 0; i < args.length; i++) {
    returnArr.push(formatAddr(args[i]));
  }
  return returnArr;
}

export enum TrxnType {ERC20, NATIVE, ADDSIGNER, REMOVESIGNER, SETQUORUM, SAFEWITHDRAWAL}
export enum Status_Dist {NONE, INITIATED, PENDING, EXECUTED, EXPIRED}
export const DECIMALS = 18;
export const SYMBOL = "TBSD";
export const NAME = "Test Base Asset";
export const TOTALSUPPLY = buildstring('1', '0', 24);
export const TOTAL_LOCKED = buildstring('7', '0', 26);
export const TEN_THOUSAND_TOKEN = parseEther('10000');
export const ONE_THOUSAND_TOKEN = parseEther('1000');
export const ONE_HUNDRED_TOKEN = parseEther('100');
export const ONE_TOKEN = parseEther('1');
export const INITIAL_ACCOUNT_BALANCE = ethers.parseEther("1.0");
export const VALUE_TO_SEND = ethers.parseEther("2.0");
export const AMOUNT_SENT_TO_ACCOUNT_ONE = parseEther('300000');
export const AMOUNT_SENT_TO_EACH_ACCOUNT_FROM_ALC1 = parseEther('100000');
export const AMOUNT_SENT_TO_STRATEGY_FROM_STRATEGY_OWNER = parseEther('100000');
export const ZERO_ADDRESS = buildstring('0x', '0', 40);
export const ZERO = parseEther('0');

/**
 * Wraps `arg` into a big number
 * @param arg : Parameter of type, to be wrapped into Bignumber
 * @returns : BigNumber instance
 */
export const bn = (arg: any): BigNumber => {
  const big = new BigNumber(arg);
  return big;
};

/**
 * Maker or service rate. 0.1 * 100 equivalent to 0.1%
*/
export const MAKER_RATE = 10;

export const INTEREST_RATE = 50; // 0.5%

/**
 * Duration for which the funds are used. Example if set 24
 * then each participant will have to return the fund to the pool
 * before 24 hours elapses.
 * In the contract, we check that this parameter is not zero, but
 * we may have to deactivate the check to allow us test the designated 
 * function
*/
export const DURATION_IN_HOURS = 24;
export const DURATION_OF_CHOICE_IN_HR = 6;
export const DURATION_OF_CHOICE_IN_SECS = bn(DURATION_OF_CHOICE_IN_HR).times(60).times(60).toNumber();
export const DURATION_IN_SECS = DURATION_IN_HOURS * 60 * 60;
export const ONE_HOUR_ONE_MINUTE = (60 * 60) + 60;
/**
 * As an example, we set the collateral ratio to 50% i.e 1.5
 * i.e Participants must deposit collateral in XFI in the 
 * value 1.5 * 100 * totalContribution.
*/
export const COLLATER_COVERAGE_RATIO = 150;

/**
 * Minimum contribution 2USD
*/
export const MINIMUM_LIQUIDITY = BigInt('2000000000000000000');

/**
 * Contribution amount $5USD
*/
export const UNIT_LIQUIDITY = BigInt('5000000000000000000'); 
export const TOTAL_LIQUIDITY = BigInt('15000000000000000000'); // unit * 3

/**
 * Transfer amount: 10,000 Token
 */
export const AMOUNT = BigInt('10000000000000000000000');
export const FEE = BigInt('10000000000000000'); //0.1
export const USD_XFI_TESTNET: Address = "0x874069fa1eb16d44d622f2e0ca25eea172369bc1";

/**
 * Dummy addresses used as signers.
 * You can replace with yours.
 */
export const DUMMY_ADDRESS: Addresses = ["0x16101742676EC066090da2cCf7e7380f917F9f0D", "0x85AbBd0605F9C725a1af6CA4Fb1fD4dC14dBD669", "0xef55Bc253297392F1a2295f5cE2478F401368c27"];

/**
 * The number of participants to form a band
 */
export const QUORUM = 3;

/**
 * Dummy dev address
 */
export const DEV: Address = DUMMY_ADDRESS[0];

/**
 * Dummy fee receiver.
 */
export const FEETO: Address = DUMMY_ADDRESS[0];

/**
 * Test that arg0 is true
 * @param arg0 : Parameter that evaluate to true
 * @param errorMessage : Result message if arg0 is false
 */
export function assertTrue(arg0: boolean, errorMessage?: string) {
  if (!arg0) throw new Error(errorMessage);
}

/**
 * Test that arg0 is false
 * @param arg0 : Parameter that evaluates to false
 * @param errorMessage : Result message if arg0 is false
 */
export function assertFalse(arg0: boolean, errorMessage?: string) {
  if (arg0) throw new Error(errorMessage);
}

/**
 * Accept input of type BigNumber, formats to a number.
 * @param arg : StrBigHex
 * @returns : Number
 */
export const formatToNumber = (arg: StrBigHex): number => {
  return bn(arg).toNumber();
};

/**
 * Accept input of type BigNumber, formats to a string.
 * @param arg : StrBigHex
 * @returns : string
 */
export const formatToString = (arg: StrBigHex): string => {
  return bn(arg).toString();
};

/**
 * @dev Converts 'x' to string
 * @param x : Parameter of type Hex
 * @returns string
 */
export const convertFromHex = (x: Hex) => Web3.utils.hexToNumberString(x);

/**
 * @dev Converts 'x' to BN
 * @param x : string | number
 * @returns Big number of type web3.utils.toBN
 */
export const wrap = (x: string | number) => Web3.utils.toBN(x);

/**
 * @dev Return the sum of 'a' and 'b'
 * @param a : Param of type StrBigHex
 * @param b : Param of type StrBigHex
 * @returns string
 */
export const sumToNumber = (a: StrBigHex, b: StrBigHex) : number => formatToNumber(bn(a).plus(bn(b)).toString());

/**
 * @dev Return the sum of 'a' and 'b'
 * @param a : Param of type StrBigHex
 * @param b : Param of type StrBigHex
 * @returns string
 */
export const sumToString = (a: StrBigHex, b: StrBigHex) : string => bn(a).plus(bn(b)).toString();

/**
 * @dev Return the mul of 'a' and 'b'
 * @param a : Param of type StrBigHex
 * @param b : Param of type StrBigHex
 * @returns string
 */
export const mulToString = (a: StrBigHex, b: StrBigHex) : string => {
  if(bn(a).isZero() || bn(b).isZero()) return bn(0).toString();
  return bn(a).times(bn(b)).toString();
}

/**
 * @dev Return the result of subtracting 'b' from 'a'
 * @param a : Param of type StrBigHex
 * @param b : Param of type StrBigHex
 * @returns BigNumber
 */
export const reduce = (a: StrBigHex, b: StrBigHex): BigNumber => {
  assertTrue(bn(a).gte(bn(b)), `${a} is less than ${b}`);
  return bn(a).minus(bn(b));
};

/**
 * @dev Check if 'a' and 'b' are equal.
 * @param a : Param of type string | BigNumber | Hex
 * @param b : Param of type string | BigNumber | Hex
 * @returns void
 */
export const compareEqualNumber = (a: StrBigHex, b: StrBigHex): NullNoPromise => {
  expect(formatToNumber(a)).to.equal(formatToNumber(b));
};

/**
 * @dev Check if 'a' and 'b' are equal.
 * @param a : Param of type string
 * @param b : Param of type string
 * @returns void
 */
export const compareEqualString = (a: string, b: string): NullNoPromise => {
  expect(a).to.equal(b);
};

