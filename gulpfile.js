t:let tmplFolder = 'tmpl'; //template folder
let srcFolder = 'src'; //source folder
let buildFolder = 'build';

let gulp = require('gulp');
let watch = require('gulp-watch');
let del = require('del');
let fs = require('fs');
let ts = require('typescript');
let concat = require('gulp-concat');
let combineTool = require('../magix-composer/index');

combineTool.config({
    debug: true,
    commonFolder: tmplFolder,
    compiledFolder: srcFolder,
    projectName: 'o',
    loaderType: 'cmd_es',
    md5CssSelectorLen: 3,
    galleries: {
        mxRoot: 'gallery/'
    },
    scopedCss: [
        './tmpl/assets/index.less'
    ],
    compileJSStart(content) {
        var str = ts.transpileModule(content, {
            compilerOptions: {
                lib: ['es7'],
                target: 'es6',
                module: ts.ModuleKind.None
            }
        });
        str = str.outputText;
        return str;
    }
});

gulp.task('cleanSrc', () => del(srcFolder));

gulp.task('combine', gulp.series('cleanSrc', () => {
    return combineTool.combine().then(() => {
        console.log('complete');
    }).catch(function (ex) {
        console.log('gulpfile:', ex);
        process.exit();
    });
}));

gulp.task('watch', gulp.series('combine', () => {
    watch(tmplFolder + '/**/*', e => {
        if (fs.existsSync(e.path)) {
            var c = combineTool.processFile(e.path);
            c.catch(function (ex) {
                console.log('ex', ex);
            });
        } else {
            combineTool.removeFile(e.path);
        }
    });
}));

var terser = require('gulp-terser-scoped');
gulp.task('cleanBuild', () => {
    return del(buildFolder);
});

gulp.task('build', gulp.series('cleanBuild', 'cleanSrc', () => {
    combineTool.config({
        debug: false
    });
    combineTool.combine().then(() => {
        gulp.src(srcFolder + '/**/*.js')
            .pipe(terser({
                compress: {
                    drop_console: true,
                    drop_debugger: true,
                    global_defs: {
                        DEBUG: false
                    }
                }
            }))
            .pipe(gulp.dest(buildFolder));
    }).catch(ex => {
        console.error(ex);
    });
}));

gulp.task('dist', gulp.series('cleanSrc', () => {
    return del('./dist').then(() => {
        combineTool.config({
            debug: false
        });
        return combineTool.combine();
    }).then(() => {
        return gulp.src([
            './src/office.js',
            './src/views/**'])
            .pipe(concat('office.js'))
            .pipe(gulp.dest('./dist'));
    });
}));

gulp.task('cdist', () => {
    return gulp.src('./dist/*.js')
        .pipe(terser({
            compress: {
                drop_console: true,
                drop_debugger: true,
                global_defs: {
                    DEBUG: false
                }
            },
            output: {
                ascii_only: true
            }
        }))
        .pipe(gulp.dest('./dist'));
});
