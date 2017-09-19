/*!
 * gulp
 * $ npm install gulp gulp-ruby-sass gulp-cached gulp-uglify gulp-rename gulp-concat gulp-notify gulp-filter gulp-jshint gulp-rev-append gulp-cssnano gulp-imagemin browser-sync gulp-file-include gulp-autoprefixer del --save-dev
 */

// Load plugins
var gulp = require('gulp'), // 必须先引入gulp插件
del = require('del'),  // 文件删除
sass = require('gulp-ruby-sass'), // sass 编译
cached = require('gulp-cached'), // 缓存当前任务中的文件，只让已修改的文件通过管道
uglify = require('gulp-uglify'), // js 压缩
rename = require('gulp-rename'), // 重命名
concat = require('gulp-concat'), // 合并文件
notify = require('gulp-notify'), // 相当于 console.log()
filter = require('gulp-filter'), // 过滤筛选指定文件
jshint = require('gulp-jshint'), // js 语法校验  npm install --save-dev jshint gulp-jshint
//rev = require('gulp-rev-append'), // 插入文件指纹（MD5）
cssnano = require('gulp-cssnano'), // CSS 压缩
smushit = require('gulp-smushit'),
plumber = require('gulp-plumber'),   //错误中断
notify = require('gulp-notify'),    //错误提示
browserSync = require('browser-sync'), // 保存自动刷新
fileinclude = require('gulp-file-include'), // 可以 include html 文件
//map = require( 'map-stream' ),
rev = require('gulp-rev'),
packageJSON  = require('./package'),
jshintConfig = packageJSON.jshintConfig,//jshint配置信息读取
autoprefixer = require('gulp-autoprefixer'); // 添加 CSS 浏览器前缀

    
  var sourceData = {
      sourUrl:'src',  //生产环境根目录
      distUrl:'dist'  //编译跟目录
  }

  function handleErrors(){
        var args = Array.prototype.slice.call(arguments);
        notify.onError({
            title: 'compile error',
            message: '<%=error.message %>'
        }).apply(this, args);//替换为当前对象
    
        this.emit();//提交
    }

// sass
gulp.task('sass', function() {
return sass(sourceData.sourUrl+'/scss/**/*.scss', {style: 'expanded'})  // 传入 sass 目录及子目录下的所有 .scss 文件生成文件流通过管道并设置输出格式
    .pipe(cached('sass'))  // 缓存传入文件，只让已修改的文件通过管道（第一次执行是全部通过，因为还没有记录缓存）
    .pipe(autoprefixer('last 6 version')) // 添加 CSS 浏览器前缀，兼容最新的5个版本
    .pipe(gulp.dest(sourceData.distUrl+'/css')) // 输出到 dist/css 目录下（不影响此时管道里的文件流）
    .pipe(rename({suffix: '.min'})) // 对管道里的文件流添加 .min 的重命名
    .pipe(cssnano()) // 压缩 CSS
    .pipe(gulp.dest(sourceData.distUrl+'/css')) // 输出到 dist/css 目录下，此时每个文件都有压缩（*.min.css）和未压缩(*.css)两个版本
});

// css （拷贝 *.min.css，常规 CSS 则输出压缩与未压缩两个版本）
gulp.task('css', function() {
return gulp.src(sourceData.sourUrl+'/css/**/*.css')
    .pipe(cached('css'))
    // .pipe(gulp.dest('dist/css')) // 把管道里的所有文件输出到 dist/css 目录
    .pipe(filter(['**/*', '!**/*.min.css'])) // 筛选出管道中的非 *.min.css 文件
    .pipe(autoprefixer('last 6 version'))
    .pipe(gulp.dest(sourceData.distUrl+'/css')) // 把处理过的 css 输出到 dist/css 目录
    .pipe(rename({suffix: '.min'}))
    .pipe(cssnano())
    .pipe(gulp.dest(sourceData.distUrl+'/css'))
});
// plugincss （拷贝 *.min.css，常规 CSS 则输出压缩与未压缩两个版本）
gulp.task('plugincss', function() {
return gulp.src(sourceData.sourUrl+'/plugin/**/*.css')
    .pipe(cached('css'))
    // .pipe(gulp.dest('dist/plugin')) // 把管道里的所有文件输出到 dist/css 目录
    .pipe(filter(['**/*', '!**/*.min.css'])) // 筛选出管道中的非 *.min.css 文件
    .pipe(autoprefixer('last 6 version'))
    .pipe(gulp.dest(sourceData.distUrl+'/plugin')) // 把处理过的 css 输出到 dist/css 目录
    .pipe(rename({suffix: '.min'}))
    .pipe(cssnano())
    .pipe(gulp.dest(sourceData.distUrl+'/plugin'))
});

// styleReload （结合 watch 任务，无刷新CSS注入）
gulp.task('styleReload', ['sass', 'css'], function() {
return gulp.src([sourceData.distUrl+'/css/**/*.css'])
    .pipe(cached('style'))
    .pipe(browserSync.reload({stream: true})); // 使用无刷新 browserSync 注入 CSS
});

// script （拷贝 *.min.js，常规 js 则输出压缩与未压缩两个版本）
gulp.task('script', function() {
return gulp.src([sourceData.sourUrl+'/js/**/*.js'])
    .pipe(plumber({errorHandler: notify.onError("sdsdaassError: <%= error.message %>"),message:'js语法错误'})) //加入plumber
    .on('error', handleErrors)     
    .pipe(plumber())
    .pipe(cached('script'))
    .pipe(filter(['**/*', '!**/*.min.js'])) // 筛选出管道中的非 *.min.js 文件
    .pipe(jshint(jshintConfig)) // js的校验，根据需要开启
    .pipe(jshint.reporter('default'))
    //.pipe(myReporter)      //自定义错误
    // .pipe(concat('main.js'))
    // .pipe(gulp.dest('dist/js'))
    .pipe(rename({suffix: '.min'}))
    .pipe(uglify({
        mangle: {
            except:['require','exports','module'],//这几个变量不能压缩混淆
        },
        compress: true,//类型：Boolean 默认：true 是否完全压缩
        preserveComments: 'all' //保留所有注释
    }))
    .pipe(gulp.dest(sourceData.distUrl+'/js'))
});
// plugin （拷贝 *.min.js，常规 js 则输出压缩与未压缩两个版本）
gulp.task('plugin', function() {
return gulp.src([sourceData.sourUrl+'/plugin/**/*.js'])
    .pipe(plumber({errorHandler: notify.onError("sdsdaassError: <%= error.message %>"),message:'js语法错误'})) //加入plumber
    .on('error', handleErrors)     
    .pipe(cached('script'))
    .pipe(filter(['**/*', '!**/*.min.js'])) // 筛选出管道中的非 *.min.js 文件
    //.pipe(myReporter)      //自定义错误
    // .pipe(concat('main.js'))
    // .pipe(gulp.dest('dist/js'))
    .pipe(rename({suffix: '.min'}))
    .pipe(uglify({
        mangle: {
            except:['require','exports','module'],//这几个变量不能压缩混淆
        },
        compress: true,//类型：Boolean 默认：true 是否完全压缩
        preserveComments: 'all' //保留所有注释
    }))
    .pipe(gulp.dest(sourceData.distUrl+'/plugin'))
});


//image
 gulp.task('image', function () {
    return gulp.src(sourceData.sourUrl+'/img/*')
        .pipe(smushit({
            verbose: true
        }))
        .pipe(gulp.dest(sourceData.distUrl+'/img'));
}); 





//html文件添加
gulp.task('html', function() {
gulp.src(path.dev.html+"/*.html")
    .pipe(rev())                    // html 引用文件添加版本号
    .pipe(gulp.dest(path.dist.html))
    .pipe(reload({stream: true}));
});



// clean 清空 dist 目录  一次执行
gulp.task('clean', function() {
return del(sourceData.distUrl+'/**/*');
});

// build，关连执行全部编译任务
gulp.task('build', ['sass', 'css', 'script','plugin','plugincss','image']);

// default 默认任务，依赖清空任务
gulp.task('default', ['clean'], function() {
gulp.start('build');
});

// watch 开启本地服务器并监听
gulp.task('watch', function() {
browserSync.init({
    // proxy: "http://127.0.0.1:63/m/",  //启动已有服务
    server: {
        baseDir: './', // 在 dist 目录下启动本地服务器环境，自动启动默认浏览器
        index:'html/index.html'
    }
});
// 监控 SASS 文件，有变动则执行CSS注入
gulp.watch(sourceData.sourUrl+'/scss/**/*.scss', ['styleReload']);
// 监控 CSS 文件，有变动则执行CSS注入
gulp.watch(sourceData.sourUrl+'/css/**/*.css', ['styleReload']);
// 监控 js 文件，有变动则执行 script 任务
gulp.watch(sourceData.sourUrl+'/js/**/*.js', ['script']);
gulp.watch(sourceData.sourUrl+'/plugin/**/*.js', ['plugin']);
// 监控图片文件，有变动则执行 image 任务
gulp.watch(sourceData.sourUrl+'/img/**/*', ['image']);
// 监控 html 文件，有变动则执行 html 任务
// gulp.watch('static/**/*.html', ['html']);
// 监控 dist 目录下除 css 目录以外的变动（如js，图片等），则自动刷新页面
gulp.watch([sourceData.distUrl+'/**/*', '!'+sourceData.distUrl+'/css/**/*']).on('change', browserSync.reload);

});