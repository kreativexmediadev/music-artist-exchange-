import { Artist } from '@/types/artist';

const BASE_PRICE = 1; // $1
const PRICE_MULTIPLIER = 0.05; // $0.05 per token sold

/**
 * Calculates the current token price for an artist based on tokens sold
 * Formula: price = basePrice + (tokensSold * priceMultiplier)
 * 
 * @param artist - The artist object containing token information
 * @returns The current token price in USD
 */
export function getTokenPrice(artist: Artist): number {
  return BASE_PRICE + (artist.tokensSold * PRICE_MULTIPLIER);
}

/**
 * Calculates the total value of all tokens for an artist
 * 
 * @param artist - The artist object containing token information
 * @returns The total value of all tokens in USD
 */
export function getTotalTokenValue(artist: Artist): number {
  return getTokenPrice(artist) * artist.tokenSupply;
}

/**
 * Calculates the percentage of tokens sold
 * 
 * @param artist - The artist object containing token information
 * @returns The percentage of tokens sold (0-100)
 */
export function getTokenProgress(artist: Artist): number {
  return (artist.tokensSold / artist.tokenSupply) * 100;
} 