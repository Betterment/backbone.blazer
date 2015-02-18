module.exports = function(grunt) {
    require('load-grunt-tasks')(grunt);

    grunt.initConfig({
        jshint: {
            all: {
                options: {
                    jshintrc: '.jshintrc'
                },
                src: ['trailblazer.js']
            }
        }
    });

    grunt.registerTask('default', ['jshint']);
};
