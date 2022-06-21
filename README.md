# Motion Canvas Examples

## How to run

This project uses Git Large File Storage for storing non-textual assets like images and audio.
Make sure that you have [Git LFS][git-lfs] installed and that you cloned the project using git.
**Downloading it as a ZIP archive will result in said assets missing.**

1. Clone the project

2. Follow [the authentication instruction][authentication] in the core repo.
3. Install all the necessary packages in the root of the project:
   ```shell
   npm install 
   ```
4. Run one of the available examples, for instance:
   ```shell
   npm run animating-with-code 
   ```
   Take a look at [`package.json`](./package.json) for the list of available examples.

[git-lfs]: https://git-lfs.github.com/
[authentication]: https://github.com/motion-canvas/core#authenticate-to-github-packages