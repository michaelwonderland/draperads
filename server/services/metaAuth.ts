import { BusinessAdAccount, FacebookAdsApi, APIRequest } from 'facebook-nodejs-business-sdk';
import type { Response } from 'express';

// Initialize the Facebook Ads API
const api = FacebookAdsApi.init(process.env.META_APP_SECRET);

// Login URL configuration constants
const REDIRECT_URI = process.env.NODE_ENV === 'production'
  ? `${process.env.BASE_URL}/api/meta/callback`
  : 'https://localhost:5000/api/meta/callback';

const SCOPES = [
  'ads_management',
  'ads_read',
  'business_management',
  'pages_read_engagement',
  'pages_manage_ads',
  'instagram_basic',
  'instagram_content_publish',
];

/**
 * Generates a URL for Meta Login
 * @returns The login URL for redirecting users to Meta authorization
 */
export function getMetaLoginUrl(): string {
  const state = Math.random().toString(36).substring(2, 15);
  
  // Store the state in session to verify later

  return `https://www.facebook.com/v19.0/dialog/oauth?client_id=${process.env.META_APP_ID}&redirect_uri=${REDIRECT_URI}&state=${state}&scope=${SCOPES.join(',')}`;
}

/**
 * Handles the OAuth callback from Meta
 * @param code The authorization code from Meta callback
 * @param redirectUri The redirect URI used in the initial request
 * @returns Access token response
 */
export async function handleMetaCallback(code: string, state: string): Promise<any> {
  try {
    // Exchange code for access token
    const tokenUrl = `https://graph.facebook.com/v19.0/oauth/access_token?client_id=${process.env.META_APP_ID}&redirect_uri=${REDIRECT_URI}&client_secret=${process.env.META_APP_SECRET}&code=${code}`;
    
    const response = await fetch(tokenUrl);
    if (!response.ok) {
      throw new Error(`Failed to exchange code for token: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error handling Meta callback:', error);
    throw error;
  }
}

/**
 * Fetches ad accounts associated with the user
 * @param accessToken User access token
 * @returns List of ad accounts
 */
export async function getAdAccounts(accessToken: string): Promise<any[]> {
  try {
    FacebookAdsApi.init(accessToken);
    
    // Create a request to fetch the user's ad accounts
    const url = 'https://graph.facebook.com/v19.0/me/adaccounts';
    const params = {
      fields: 'id,name,account_id,account_status',
      access_token: accessToken,
    };
    
    const queryParams = new URLSearchParams(params).toString();
    const response = await fetch(`${url}?${queryParams}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch ad accounts: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching ad accounts:', error);
    throw error;
  }
}

/**
 * Fetches Facebook Pages associated with the user
 * @param accessToken User access token
 * @returns List of pages
 */
export async function getFacebookPages(accessToken: string): Promise<any[]> {
  try {
    // Create a request to fetch the user's pages
    const url = 'https://graph.facebook.com/v19.0/me/accounts';
    const params = {
      fields: 'id,name,access_token,picture',
      access_token: accessToken,
    };
    
    const queryParams = new URLSearchParams(params).toString();
    const response = await fetch(`${url}?${queryParams}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch Facebook pages: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching Facebook pages:', error);
    throw error;
  }
}

/**
 * Fetches Instagram accounts connected to Facebook Pages
 * @param accessToken User access token
 * @param pageId Facebook Page ID
 * @returns List of Instagram accounts
 */
export async function getInstagramAccounts(accessToken: string, pageId: string): Promise<any[]> {
  try {
    // Create a request to fetch Instagram accounts connected to the page
    const url = `https://graph.facebook.com/v19.0/${pageId}/instagram_accounts`;
    const params = {
      fields: 'id,name,username,profile_pic',
      access_token: accessToken,
    };
    
    const queryParams = new URLSearchParams(params).toString();
    const response = await fetch(`${url}?${queryParams}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch Instagram accounts: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching Instagram accounts:', error);
    throw error;
  }
}

/**
 * Creates a Meta ad
 * @param accessToken User access token
 * @param adData Ad creation data
 * @returns Created ad info
 */
export async function createMetaAd(accessToken: string, adData: any): Promise<any> {
  try {
    FacebookAdsApi.init(accessToken);
    
    // Implementation will depend on specific requirements
    // This is a placeholder for the actual ad creation logic
    
    return { success: true, adId: 'mock_ad_id' };
  } catch (error) {
    console.error('Error creating Meta ad:', error);
    throw error;
  }
}

/**
 * Handles error responses
 * @param res Express response object
 * @param error Error object
 * @param statusCode HTTP status code
 */
export function handleMetaApiError(res: Response, error: any, statusCode = 500): void {
  console.error('Meta API Error:', error);
  
  const errorMessage = error.response?.body?.error?.message || error.message || 'Unknown error';
  res.status(statusCode).json({
    error: true,
    message: errorMessage,
  });
}