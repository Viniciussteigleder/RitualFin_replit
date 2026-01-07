#!/usr/bin/env node

/**
 * Simple script to test the Google OAuth flow
 * This script simulates what the browser does when clicking "Continue with Google"
 */

import https from 'https';
import { URL } from 'url';

const BASE_URL = 'https://ritual-fin-replit.vercel.app';

async function testOAuthFlow() {
  console.log('🔍 Testing Google OAuth Flow...\n');

  // Step 1: Get CSRF token
  console.log('Step 1: Getting CSRF token from /api/auth/csrf');
  const csrfResponse = await fetch(`${BASE_URL}/api/auth/csrf`);
  const csrfData = await csrfResponse.json();
  const csrfToken = csrfData.csrfToken;
  const cookies = csrfResponse.headers.get('set-cookie') || '';
  
  console.log(`✅ CSRF Token: ${csrfToken.substring(0, 20)}...`);
  console.log(`✅ Cookies: ${cookies.substring(0, 50)}...\n`);

  // Step 2: POST to /api/auth/signin with provider=google
  console.log('Step 2: POSTing to /api/auth/signin with provider=google');
  
  const formData = new URLSearchParams({
    csrfToken: csrfToken,
    callbackUrl: '/',
    json: 'true'
  });

  const signinResponse = await fetch(`${BASE_URL}/api/auth/signin/google`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Cookie': cookies
    },
    body: formData,
    redirect: 'manual' // Don't follow redirects
  });

  console.log(`Response Status: ${signinResponse.status}`);
  console.log(`Response Headers:`, Object.fromEntries(signinResponse.headers.entries()));

  const location = signinResponse.headers.get('location');
  if (location) {
    console.log(`\n✅ Redirect Location: ${location}`);
    
    // Check if it's redirecting to Google
    if (location.includes('accounts.google.com')) {
      console.log('\n🎉 SUCCESS! OAuth flow initiated correctly.');
      console.log('The application is redirecting to Google OAuth consent screen.');
      
      // Parse the redirect URL to show details
      const url = new URL(location);
      console.log('\nOAuth Parameters:');
      console.log(`  - client_id: ${url.searchParams.get('client_id')}`);
      console.log(`  - redirect_uri: ${url.searchParams.get('redirect_uri')}`);
      console.log(`  - response_type: ${url.searchParams.get('response_type')}`);
      console.log(`  - scope: ${url.searchParams.get('scope')}`);
      
      return true;
    } else if (location.includes('/api/auth/error')) {
      console.log('\n❌ FAILURE! Redirecting to error page.');
      const errorUrl = new URL(location, BASE_URL);
      console.log(`Error: ${errorUrl.searchParams.get('error')}`);
      return false;
    } else {
      console.log('\n⚠️  Unexpected redirect location.');
      return false;
    }
  } else {
    console.log('\n❌ No redirect location found.');
    const body = await signinResponse.text();
    console.log('Response body:', body.substring(0, 200));
    return false;
  }
}

// Run the test
testOAuthFlow()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  });
