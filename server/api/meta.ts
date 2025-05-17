import { Router } from 'express';
import {
  getMetaLoginUrl,
  handleMetaCallback,
  getAdAccounts,
  getFacebookPages,
  getInstagramAccounts,
  createMetaAd,
  handleMetaApiError,
} from '../services/metaAuth';

const router = Router();

/**
 * Initiates Meta authentication flow
 */
router.get('/login', (req, res) => {
  try {
    const loginUrl = getMetaLoginUrl();
    res.json({ loginUrl });
  } catch (error) {
    handleMetaApiError(res, error);
  }
});

/**
 * Handles Meta OAuth callback
 */
router.get('/callback', async (req, res) => {
  try {
    const { code, state } = req.query;
    
    if (!code || !state) {
      return res.status(400).json({ error: true, message: 'Missing required parameters' });
    }
    
    const tokenData = await handleMetaCallback(code.toString(), state.toString());
    
    // Store token in session or database
    if (req.session) {
      req.session.metaAccessToken = tokenData.access_token;
    }
    
    // Redirect to ad creation page
    res.redirect('/ad-creator?meta_connected=true');
  } catch (error) {
    handleMetaApiError(res, error);
  }
});

/**
 * Gets user's Meta ad accounts
 */
router.get('/accounts', async (req, res) => {
  try {
    // Get token from session
    const accessToken = req.session?.metaAccessToken;
    if (!accessToken) {
      return res.status(401).json({ error: true, message: 'Not authenticated with Meta' });
    }
    
    const adAccounts = await getAdAccounts(accessToken);
    res.json({ accounts: adAccounts });
  } catch (error) {
    handleMetaApiError(res, error);
  }
});

/**
 * Gets user's Facebook pages
 */
router.get('/pages', async (req, res) => {
  try {
    // Get token from session
    const accessToken = req.session?.metaAccessToken;
    if (!accessToken) {
      return res.status(401).json({ error: true, message: 'Not authenticated with Meta' });
    }
    
    const pages = await getFacebookPages(accessToken);
    res.json({ pages });
  } catch (error) {
    handleMetaApiError(res, error);
  }
});

/**
 * Gets Instagram accounts connected to a Facebook page
 */
router.get('/instagram/:pageId', async (req, res) => {
  try {
    // Get token from session
    const accessToken = req.session?.metaAccessToken;
    if (!accessToken) {
      return res.status(401).json({ error: true, message: 'Not authenticated with Meta' });
    }
    
    const { pageId } = req.params;
    const instagramAccounts = await getInstagramAccounts(accessToken, pageId);
    res.json({ instagramAccounts });
  } catch (error) {
    handleMetaApiError(res, error);
  }
});

/**
 * Creates a Meta ad
 */
router.post('/create-ad', async (req, res) => {
  try {
    // Get token from session
    const accessToken = req.session?.metaAccessToken;
    if (!accessToken) {
      return res.status(401).json({ error: true, message: 'Not authenticated with Meta' });
    }
    
    const adData = req.body;
    const result = await createMetaAd(accessToken, adData);
    res.json(result);
  } catch (error) {
    handleMetaApiError(res, error);
  }
});

/**
 * Checks if user is authenticated with Meta
 */
router.get('/status', (req, res) => {
  const isAuthenticated = !!req.session?.metaAccessToken;
  res.json({ isAuthenticated });
});

export default router;