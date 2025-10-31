// cucumber.js
require('dotenv').config();
module.exports = {
  default: [
    '--require support/timeouts.js',
    '--require support/hooks.js',
    '--require support/world.js',
    '--require support/ui-helpers.js',
    '--require support/test-data.js',
    '--require step_definitions/common.steps.js',
    '--require step_definitions/e-bebek.steps.js',
    '--format progress',
    '--format summary',
    '--format json:reports/cucumber-report.json',
    '--format @cucumber/pretty-formatter',
    'features/**/*.feature',
    '--fail-fast',
    '--exit'
  ].join(' ')
};
