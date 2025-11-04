# GitHub Pages Debug Checklist

## Quick Checks:

1. **GitHub Pages Settings**:
   - Go to your repo → Settings → Pages
   - Verify "Source" is set to "GitHub Actions" (not a branch)
   - Check the custom domain field is empty (unless using custom domain)

2. **Wait Time**:
   - GitHub Pages can take 1-5 minutes to propagate changes
   - Try accessing the site after waiting a few minutes

3. **URL Format**:
   - Make sure you're accessing: `https://calico-care.github.io/Calico-Demo/` (with trailing slash)
   - Or try: `https://calico-care.github.io/Calico-Demo/index.html`

4. **Browser Cache**:
   - Try incognito/private window
   - Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

5. **Check the Build Logs**:
   - After pushing, check the Actions tab
   - Look at the "List build output" step to see what files were created
   - Share the output if you can

6. **Verify Files Exist**:
   - The dist folder should contain: `index.html`, `404.html`, and an `assets/` folder
   - All files should be at the root of `dist/` (not in a subfolder)

