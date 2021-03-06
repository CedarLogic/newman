#!/usr/bin/env node
require('../lib/node-version-check');

var _ = require('lodash'),

    cli = require('../lib/cli'),
    newman = require('../'),

    /**
     * Calls the appropriate Newman command
     *
     * @param options
     * @param callback
     */
    dispatch = function (options, callback) {
        var command = options.command;

        if (_.isFunction(newman[command])) {
            newman[command](options[command], callback);
        }
        else {
            callback(new Error('Oops, unsupported command: ' + options.command));
        }
    };

cli(process.argv.slice(2), 'newman', function (err, args) {
    if (err) {
        err.help && console.info(err.help + '\n');  // will print out usage information.
        console.error(err.message || err);
        return process.exit(1); // @todo: args do not arrive on CLI error hence cannot read `-x`
    }

    dispatch(args, function (err, summary) {
        var runError = err || summary.run.error || summary.run.failures.length;

        if (err) {
            err.help && console.info(err.help);  // will print out usage information.
            console.error(err.message || err);
        }

        if (runError && !_.get(args, 'run.suppressExitCode')) {
            process.exit(1);
        }
    });
});
