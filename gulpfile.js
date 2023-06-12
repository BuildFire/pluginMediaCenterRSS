const gulp = require('gulp');
const del = require('del');
const minHTML = require('gulp-htmlmin');
const minifyCSS = require('gulp-csso');
const concat = require('gulp-concat');
const strip = require('gulp-strip-comments');
const htmlReplace = require('gulp-html-replace');
const uglifyTerser = require('gulp-terser');
const eslint = require('gulp-eslint');
const gulpSequence = require('gulp-sequence');
const minifyInline = require('gulp-minify-inline');
const gutil = require('gulp-util');

const destinationFolder = releaseFolder();

function releaseFolder() {
    var arr = __dirname.split("/");
    var fldr = arr.pop();
    arr.push(fldr + "_release");
    return arr.join("/");
}

console.log(">> Building to ", destinationFolder);

const widgetCssFiles = [
    'widget/assets/css/style.css',
    'widget/assets/css/videogular.css',
]

const cssTasks = [
    {name: "widgetCSS", src: widgetCssFiles, dest: "/widget/styles"}
    , {name: "controlContentCSS", src: "control/content/**/*.css", dest: "/control/content/styles"}
    , {name: "controlDesignCSS", src: "control/design/**/*.css", dest: "/control/design/styles"}
    , {name: "controlSettingsCSS", src: "control/content/assets/css/base.css", dest: "/control/settings/styles"}
];

const cssInjection = [
    { name: "cssInjection", src: "widget/assets/css/layout1.css", dest: "widget/styles/layout1.css", dest: "/widget/styles" }
];

cssInjection.forEach(function (task) {
    gulp.task(task.name, function () {
        return gulp.src(task.src, { base: '.' })
            .pipe(concat('layout1.css'))
            .pipe(gulp.dest(destinationFolder + task.dest))
    });
});

cssTasks.forEach(function (task) {
    /*
     Define a task called 'css' the recursively loops through
     the widget and control folders, processes each CSS file and puts
     a processes copy in the 'build' folder
     note if the order matters you can import each css separately in the array

     */
    gulp.task(task.name, function () {
        return gulp.src(task.src, {base: '.'})

        /// minify the CSS contents
            .pipe(minifyCSS())

            ///merge
            .pipe(concat('styles.min.css'))

            /// write result to the 'build' folder
            .pipe(gulp.dest(destinationFolder + task.dest))
    });
});

const widgetJSFiles = [
    "widget/assets/js/lodash.js",
    "widget/assets/js/jquery.truncate.js",
    "widget/assets/js/ng-videosharing-embed.min.js",
    "widget/assets/js/angular-sanitize.js",
    "widget/assets/js/videogular.js",
    "widget/assets/js/videogular-controls.js",
    "widget/assets/js/videogular-overlay-play.js",
    "widget/app.js",
    "widget/modals.js",
    "widget/app.services.js",
    "widget/enums.js",
    "widget/directives.js",
    "widget/filters.js",
    "widget/viewedItems.js",
    "widget/bookmarkHandler.js",
    "widget/cacheManager.js",
    "widget/controllers/widget.home.controller.js",
    "widget/controllers/widget.media.controller.js",
    "widget/controllers/widget.nowplaying.controller.js"
];


const jsTasks = [
    // { name: "widgetJS", src: "widget/**/*.js", dest: "/widget" },
    {name: "widgetJS", src: widgetJSFiles, dest: "/widget"},
    {name: "controlContentJS", src: "control/content/**/*.js", dest: "/control/content"},
    {name: "controlDesignJS", src: "control/design/**/*.js", dest: "/control/design"},
    {name: "controlSettingsJS", src: "control/settings/**/*.js", dest: "/control/settings"}
];


gulp.task('lint', () => {
    // ESLint ignores files with "node_modules" paths.
    // So, it's best to have gulp ignore the directory as well.
    // Also, Be sure to return the stream from the task;
    // Otherwise, the task may end before the stream has finished.
    return gulp.src(['widget/**/*.js', 'control/**/*.js'])
    // eslint() attaches the lint output to the "eslint" property
    // of the file object so it can be used by other modules.
        .pipe(eslint({
            "env": {
                "browser": true,
                "es6": true
            },
            "extends": "eslint:recommended",
            "parserOptions": {
                "sourceType": "module"
            },
            "rules": {
                "semi": [
                    "warn",
                    "always"
                ],
                "no-console": [
                    "off"
                ]
            }
        }))
        // eslint.format() outputs the lint results to the console.
        // Alternatively use eslint.formatEach() (see Docs).
        .pipe(eslint.format())
        // To have the process exit with an error code (1) on
        // lint error, return the stream and pipe to failAfterError last.
        .pipe(eslint.failAfterError());
});

jsTasks.forEach(function (task) {
    gulp.task(task.name, function () {
        return gulp.src(task.src, {base: '.'})



        /// obfuscate and minify the JS files
            .pipe(uglifyTerser())
            .on('error', function (err) {
                gutil.log(gutil.colors.red('[Error]'), err.toString());
            })

            /// merge all the JS files together. If the
            /// order matters you can pass each file to the function
            /// in an array in the order you like
            .pipe(concat('scripts.min.js'))
            ///output here
            .pipe(gulp.dest(destinationFolder + task.dest));

    });

});

gulp.task('clean', function () {
    return del([destinationFolder], {force: true});
});

/*
 Define a task called 'html' the recursively loops through
 the widget and control folders, processes each html file and puts
 a processes copy in the 'build' folder
 */
gulp.task('html', function () {
    return gulp.src(['widget/**/*.html', 'widget/**/*.htm', 'control/**/*.html', 'control/**/*.htm'], {base: '.'})
    /// replace all the <!-- build:bundleJSFiles  --> comment bodies
    /// with scripts.min.js with cache buster
        .pipe(htmlReplace({
            bundleJSFiles: "scripts.min.js?v=" + (new Date().getTime())
            , bundleCSSFiles: "styles/styles.min.css?v=" + (new Date().getTime())
        }))

        /// then strip the html from any comments
        .pipe(minHTML({removeComments: true, collapseWhitespace: true}))

        .pipe(minifyInline())

        /// write results to the 'build' folder
        .pipe(gulp.dest(destinationFolder));
});


gulp.task('resources', function () {
    return gulp.src(['resources/*', 'widget/fonticons/**', 'plugin.json'], {base: '.'})
        .pipe(gulp.dest(destinationFolder));
});

gulp.task('widgetIcons', function () {
    return gulp.src(['widget/assets/css/icons/*.*'], {base: '.'})
        .pipe(gulp.dest(destinationFolder));
});


gulp.task('images', function () {
    return gulp.src(['**/.images/**', 'control/design/icons/**', 'control/design/layouts/**'], {base: '.'})
        .pipe(gulp.dest(destinationFolder));
});


var buildTasksToRun = ['html', 'resources', 'images', 'widgetIcons'];

[...cssInjection, ...cssTasks].forEach(function (task) {
    buildTasksToRun.push(task.name)
});
jsTasks.forEach(function (task) {
    buildTasksToRun.push(task.name)
});

gulp.task('build', gulpSequence('lint', 'clean', buildTasksToRun));
