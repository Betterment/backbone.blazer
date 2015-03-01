module.exports = function(grunt) {
    require('load-grunt-tasks')(grunt);

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        meta: {
            version: '<%= pkg.version %>',
            banner: '// Backbone.Blazer v<%= meta.version %>'
        },

        preprocess: {
            options: {
                context: {
                    banner: '<%= meta.banner %>'
                }
            },
            all: {
                src: 'wrapper.js',
                dest: 'dist/backbone.blazer.js'
            }
        },

        uglify: {
            options: {
                banner: '<%= meta.banner %>'
            },
            all: {
                src: '<%= preprocess.all.dest %>',
                dest: '<%= preprocess.all.dest.replace(/\.js/, \'.min.js\') %>',
                options: {
                    sourceMap: true
                }
            }
        },

        jshint: {
            all: {
                options: {
                    jshintrc: '.jshintrc'
                },
                src: ['backbone.blazer.js']
            }
        },

        mochaTest: {
            test: {
                options: {
                    require: 'test/setup.js',
                    clearRequireCache: true,
                    reporter: 'dot'
                },
                src: ['test/**/*.spec.js']
            }
        }
    });

    grunt.registerTask('build', 'Generate dist files', ['test', 'preprocess', 'uglify']);
    grunt.registerTask('test', 'Run jshint and tests.', ['jshint', 'mochaTest']);
    grunt.registerTask('default', ['test']);
};
