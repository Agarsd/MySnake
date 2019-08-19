var sw = 20,    //一个方块的宽度
    sh = 20,    //一个方块的高度
    tr = 30,    //行数
    td = 30;    //列数

var snake = null,   // 声明一个全局的变量snake实例
    food = null,    //食物的实例
    game = null;    //游戏的实例

// 方块构造函数
function Square (x, y, classname) {
    // 需要传入的是值是0,0  1,0等形式
    this.x = x * sw; //方块的x位置
    this.y = y * sh; //方块的y位置
    this.class = classname;

    //存生成方块对应的dom的div结构
    this.viewContent = document.createElement('div');
    //div中的class:'name'属性
    this.viewContent.className = this.class;
    //获取的方块的父级的dom结构
    this.parent = document.getElementById('snakeWrap');
}

//为原型上添加一个方法，是创建方块dom的方法
Square.prototype.create = function () {
    // 为方块添加css的样式属性
    this.viewContent.style.position = 'absolute';
    this.viewContent.style.width = sw + 'px';
    this.viewContent.style.height = sh + 'px';
    this.viewContent.style.left = this.x + 'px';
    this.viewContent.style.top = this.y + 'px';

    // 将方块添加到页面当中
    this.parent.appendChild(this.viewContent);
};

//为原型上添加一个方法，是删除方块dom的方法
Square.prototype.remove = function () {
    this.parent.removeChild(this.viewContent);
};

// 蛇
function Snake () {
    this.head = null;   //存一下蛇头的信息
    this.tail = null;   //存一下蛇尾的信息
    this.pos = [];      //存一下蛇身上的每一个方块的位置，是一个二维数组

    //存一下蛇走的方向，用一个对象来表示，就是存按下方向的值
    this.directionNum = {
        left: {
            x: -1,
            y: 0,
            rotate: 180
        },
        right: {
            x: 1,
            y: 0,
            rotate: 0
        },
        up: {
            x: 0,
            y: -1,
            rotate: -90
        },
        down: {
            x: 0,
            y: 1,
            rotate: 90
        }
    }
}

//在Snake构造函数的原型上添加一个初始化init方法
Snake.prototype.init = function () {
    //使用Square构造函数，创建一个蛇头
    var snakeHead = new Square(2, 0, 'snakeHead');
    // 需要渲染到页面上就需要使用Square原型上的create的方法
    snakeHead.create();
    
    // 存储蛇头信息
    this.head = snakeHead;
    // 把蛇头的位置存起来
    this.pos.push([2, 0]);

    // 创建蛇身体1
    var snakeBody1 = new Square(1, 0, 'snakeBody');
    snakeBody1.create();
    // 存一下蛇身体信息坐标
    this.pos.push([1, 0]);

    // 创建蛇身体2
    var snakeBody2 = new Square(0, 0, 'snakeBody');
    snakeBody2.create();
    // 存一下蛇尾信息
    this.tail = snakeBody2;
    // 存一下蛇身体信息坐标
    this.pos.push([0, 0]);

    // 使用链表中的last next将全部方块变成一个整体
    snakeHead.last = null;
    snakeHead.next = snakeBody1;

    snakeBody1.last = snakeHead;
    snakeBody1.next = snakeBody2;
    
    snakeBody2.last = snakeBody1;
    snakeBody2.next = null;

    // 给蛇添加一条属性，用来表示蛇走的方向
    this.direction = this.directionNum.right; //默认的情况下让蛇往右走
}

// 这一个方法用来获取蛇头的下一个位置对应的元素，要根据元素做不同的事
// 在Snake的构造方法上添加getNextPos获取下一个点的信息的方法
Snake.prototype.getNextPos = function () {
    var nextPos = [
        // 蛇头要走的下一个点的坐标
        this.head.x/sw + this.direction.x,
        this.head.y/sh + this.direction.y
    ];
    //下一个点是自己，代表撞到了自己，游戏结束
    var selfCollied = false;    //是否撞到自己
    this.pos.forEach(function(value) {
        if (value[0] == nextPos[0] && value[1] == nextPos[1]) {
            selfCollied = true;
        }
    });
    if (selfCollied) {
        this.strategies.die.call(this);
        return;
    }

    // 下一个是围墙，游戏结束
    if (nextPos[0] < 0 || nextPos[1] < 0 || nextPos[0] > td-1 || nextPos[1] > tr-1) {
        this.strategies.die.call(this);
        return;
    }

    // 下一个点是食物,吃
    if (food && food.pos[0] == nextPos[0] && food.pos[1] == nextPos[1]) {
        //如果这一个条件成立说明现在蛇头要走的下一个点是食物的那一个点
        this.strategies.eat.call(this);
        console.log('吃')
        return;
    }

    // 下一个点什么都没有,走
    this.strategies.move.call(this);

}

// 处理碰撞后要做的事,在原型上添加一个属性
Snake.prototype.strategies = {
    move: function (format) {   //format的形参决定的是蛇吃不吃的问题，当传了这个值之后是吃。
        //现在的this是指向调用的对象是this.strategies,
        // 但是需要用的是实例化的对象里面的this，所以需要在调用的时候更改一下this的指向。

        // 创建一个新身体
        var newBody = new Square(this.head.x/sw, this.head.y/sh, 'snakeBody')   //在旧蛇头的位置创建一个新身体

        //更新链表的关系
        newBody.next = this.head.next;
        newBody.next.last = newBody;
        newBody.last = null;
        this.head.remove(); //将旧蛇头移除
        newBody.create();   //将新身体添加到页面

        //创建新蛇头，新蛇头的位置就是移动下一个点的碰撞的位置
        var newHead = new Square(this.head.x/sw + this.direction.x, this.head.y/sh + this.direction.y, 'snakeHead');

        //更新链表关系
        newHead.next = newBody;
        newHead.last = null;
        newBody.last = newHead;
        newHead.viewContent.style.transform = 'rotate('+ this.direction.rotate +'deg)'
        newHead.create();

        //蛇身上每一个坐标也要更新
        //就只是需要在this.pos的前面添加上newHead的值,  splice(插入的位置, 插入多少个, 插入的值)
        this.pos.splice(0, 0, [this.head.x/sw + this.direction.x, this.head.y/sh + this.direction.y])
        this.head = newHead;    //还需要this.head更新一下

        if (!format) {  //如果format的值为false，表示需要删除（除了吃以外的操作）
            this.tail.remove();
            this.tail = this.tail.last;
            this.pos.pop(); //将数组最后的元素删除
        }

    },
    eat: function () {
        this.strategies.move.call(this, true);
        createFood();
        game.score++;
    },
    die: function () {
        // console.log('die')
        game.over();
    }
}

snake = new Snake();

//创建食物
function createFood() {
    // 食物小方块的随机坐标
    var x = null;
    var y = null;

    var include = true; //  循环跳出的条件，true表示食物在蛇身上（需要继续循环），false表示食物不在蛇身上了，跳出循环。
    while (include) {
        x = Math.round( Math.random() * (td-1) );
        y = Math.round( Math.random() * (tr-1) );

        snake.pos.forEach( function (value) {
            if (x != value[0] && y != value[1]) {
                //这个条件成立说明现在随机出来的这个坐标，在蛇身上没有找到。
                include = false;
            }
        } )
    }
    // 生成食物
    food = new Square(x, y, 'food');
    food.pos = [x, y];  //存储下一个生成的食物的坐标，用于跟蛇头要走的下一个点做对比
    // food.remove();  这样子删除是不可以的，因为还没有create的话，它不是一个dom节点、

    var foodDom = document.querySelector('.food');
    if (foodDom) {
        foodDom.style.left = x * sw + 'px';
        foodDom.style.top = y * sh + 'px';
    }else {
        food.create();
    }
}

var grid = new Array(15);
console.log(grid)
for (var i = 0; i < grid.length; i++) {
    grid[i] = new Array(15);
    for (var j = 0; j < grid[i].length; j++) {

    }
    console.log (grid)
}

//创建游戏逻辑

function Game() {
    this.timer = null;
    this.score = 0;
}

Game.prototype.init = function () {
    snake.init();
    createFood();
    // snake.getNextPos(); 

    document.onkeydown = function (ev) {
        if (ev.which == 37 && snake.direction != snake.directionNum.right) {    //用户按下左键的时候不能往右走
            snake.direction = snake.directionNum.left;
        }else if (ev.which ==38 && snake.direction != snake.directionNum.down) {
            snake.direction = snake.directionNum.up;
        }else if (ev.which ==39 && snake.direction != snake.directionNum.left) {
            snake.direction = snake.directionNum.right;
        }else if (ev.which ==40 && snake.direction != snake.directionNum.up) {
            snake.direction = snake.directionNum.down;
        }
    }
    this.start();
}

Game.prototype.start = function () {
    this.timer = setInterval(function () {
        snake.getNextPos();
    }, 200)
}

Game.prototype.over = function () {
    clearInterval(this.timer)
    alert('你的得分为：'+ this.score);

    //游戏和苹果都要清空
    var snakeWrap = document.getElementById('snakeWrap');
    snakeWrap.innerHTML = '';

    snake = new Snake();
    game = new Game();

    var startBtnWrap = document.querySelector('.startBtn');
    startBtnWrap.style.display = 'block';
}

game = new Game();
var startBtn = document.querySelector('.startBtn button');
startBtn.onclick = function () {
    startBtn.parentNode.style.display = 'none';
    game.init();
}



