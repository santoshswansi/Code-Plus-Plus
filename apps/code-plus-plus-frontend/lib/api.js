import { refreshToken } from '@/api/auth';
import { getAccessToken } from '@/helper';
import ky from 'ky';

const APIGatewayBaseURL = process.env.NEXT_PUBLIC_API_GATEWAY_BASE_URL;
const api = ky.create({
  prefixUrl: APIGatewayBaseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
  credentials: 'include',  // allow to set cookies
  hooks: {
    beforeRequest: [
      request => {
        const token = getAccessToken(); // get access token from react state
        if(token){
          request.headers.set('Authorization', `Bearer ${token}`);
        }
      }
    ],

    afterResponse: [
        async (request, options, response) => {
            if(response.status === 401){
                const newAccessToken = await refreshToken();
                if(newAccessToken){
                    request.headers.set('Authorization', `Bearer ${newAccessToken}`);
                    return ky(request, options);
                }
            }

            return response;
        }
    ]
  }
});

export default api;
