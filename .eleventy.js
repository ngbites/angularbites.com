const htmlmin = require('html-minifier');
const dateFns = require('date-fns');

const codeblocks = require('@code-blocks/eleventy-plugin');
const charts = require('@code-blocks/charts');
const prism = require('@code-blocks/prism');

module.exports = function (eleventyConfig) {
  eleventyConfig.setDataDeepMerge(true);
  eleventyConfig.addLayoutAlias('post', 'layouts/post.ejs');

  eleventyConfig.addPlugin(codeblocks([charts, prism]));

  eleventyConfig.setEjsOptions({
    rmWhitespace: true,
    context: {
      dateFns,
    },
  });

  eleventyConfig.setBrowserSyncConfig({
    files: './_site/assets/styles/main.css',
  });

  // eleventyConfig.addPassthroughCopy('src/assets');

  eleventyConfig.addTransform('htmlmin', (content, outputPath) => {
    if (outputPath.endsWith('.html')) {
      const minified = htmlmin.minify(content, {
        useShortDoctype: true,
        removeComments: true,
        collapseWhitespace: true,
        minifyJS: true,
      });
      return minified;
    }

    return content;
  });

  return {
    dir: { input: 'src', output: '_site', data: '_data' },
  };
};
