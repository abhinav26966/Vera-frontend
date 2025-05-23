# Vera Frontend

This is the frontend for the Vera hotel assistant application.

## Deployment to Vercel

### Step 1: Configure Environment Variables

Before deploying to Vercel, you need to set up your environment variables:

1. In the Vercel dashboard, go to your project settings
2. Under "Environment Variables", add:
   - `REACT_APP_API_URL` = Your backend API URL (e.g., https://your-api-url.com)

### Step 2: Deploy from Dashboard

1. Import your GitHub repository
2. Set the framework preset to "Create React App"
3. Set the root directory to `./frontend` (if your frontend is in a subdirectory)
4. Deploy!

### Step 3: Configure Custom Domain (Optional)

1. In the Vercel dashboard, go to your project settings
2. Under "Domains", add your custom domain

## Troubleshooting Blank Screen Issues

If you're seeing a blank screen after deployment:

1. **API Connection Issues**: Make sure your API URL is correctly set as an environment variable and that CORS is properly configured on your backend.

2. **Build Issues**: Check the Vercel build logs for any errors or warnings.

3. **Route Configuration**: Ensure the routes in `vercel.json` are correctly configured for a Single Page Application.

4. **Browser Console**: Check the browser console for any JavaScript errors.

5. **Try `/error.html`**: If deployed, navigate to `/error.html` to view the debug page.

## Local Development

```
npm install
npm start
```

This will start the development server at http://localhost:3000.

## Build for Production

```
npm run build
```

This creates a production-ready build in the `build` folder. 