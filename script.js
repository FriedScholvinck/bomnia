var scaling = "fit"; // this will resize to fit inside the screen dimensions
var width = 1400;
var height = 800;
// var color = '#2d4d9d'; // or any HTML color such as "violet" or "#333333"
var color = white; // or any HTML color such as "violet" or "#333333"
// var outerColor = '#2d4d9d';
var outerColor = white;
var xomnia_color = '#2d4d9d';
var xomnia_color = white;

var assets = [
  "https://raw.githubusercontent.com/karelrosseel/evadeherdt/master/falling/bomb.png",
  "https://raw.githubusercontent.com/karelrosseel/evadeherdt/master/falling/coin.png",
  "https://raw.githubusercontent.com/karelrosseel/evadeherdt/master/falling/hit.png",
  "https://raw.githubusercontent.com/karelrosseel/evadeherdt/master/falling/uitroep.png",
  "https://raw.githubusercontent.com/karelrosseel/evadeherdt/master/falling/man.png",
  "bomnia_transparant.png"
];
var path = "assets/";

var frame = new zim.Frame(scaling, width, height, color, outerColor, assets);

frame.on("ready", function () {
  zog("ready from ZIM Frame");
  
  var stage = frame.stage;
  var stageW = frame.width;
  var stageH = frame.height;

  // To make things fall we add an animate function to the Ticker
  // that adds a number of pixels (speed) to the object each Tick
  // the Ticker will add a stage.update automatically
  // on option is to use move() to individually tween the item
  // but this can be more work than necessary for the processor
  // so just animating with code is fine

  // often we want to make multiple copies fall
  // we can create a setTimeout function and have it make a clone of an asset
  // then at the end of the setTimeout function we call the function again
  // this has the advantage of being able to set up random times between drop

  // to animate multiple objects it is best to add the objects to a createjs.Container
  // then we can loop through the objects in the container and move each one

  // we often have something that is catching or avoiding the falling objects
  // for instance, a person - then we might want the person to follow the mouse
  // or perhaps keyboard or drag in some cases
  // it is nice when damping is used on the movement of the person as well

  // we will probably want to check if the person catches or hits the objects
  // in the animation loop where we move the objects
  // we need can do a hitTest to see if the object has hit the person
  // depending on how many objects and their shapes
  // we choose from the variety of zim hitTests
  // the fastest hitTest is hitTestBounds as it calculates rectangle intersection
  // others may bog if there are too many as they use graphical hitTests

  // EXTRA
  // we might want to keep score if we are collecting things
  // and perhaps make the person lose points or die if they get hit
  // we may want to have multiple types of things falling worth different points
  // in that case, as we make the object we assign the points as a property of the object
  // and then when we check the hit test, we can access the points
  // we would want to add sounds, perhaps levels with different speeds, etc.

  // STEPS
  // 1. create a backing that can be used as a mask (or just go full screen)
  // 2. create a container for the game (or just use the stage)
  // 3. create a person to dodge and catch items and position at the bottom
  // 4. optionally start the game when the user moves their mouse or swipes
  // 5. add a Ticker to run an animation function
  // note: Ticker consolidates and manages stage.updates
  // 6. call drop functions
  // 7. make a createjs.Container for the dropped items
  // 8. make the drop function to add a clone of the item to the container
  // 9. use a interval to randomly set the interval (and use requestAnimationFrame)
  // 10. set a Damp object to handle damping the movement of the person
  // 11. in the animate function move the person to the damped stage.mouseX
  // 12. loop backwards through all the children of the falling item container
  // 13. move the item
  // 14. check to see of the item is hitting the player
  // 15. if so then do whatever and remove the item from the container
  // 16. also check to see if item has fallen past the ground
  // 17. we can make little animations, etc. when things are hit

  // STEPS
  // 1. create a backing that can be used as a mask (or just go full screen)
  var backing = new Rectangle(stageW - 80, stageH - 250, xomnia_color)
    .center()
    .mov(0, -20);

  // 2. create a container for the game (or just use the stage)
  var game = new Container(backing.width, backing.height)
    .loc(backing)
    .setMask(backing);

  var logo = frame
    .asset('bomnia_transparant.png')
    .loc(game.width / 2, game.height, game);
  logo.reg(logo.width / 2, logo.height);
  logo.scaleX = 0.6;
  logo.scaleY = 0.6;


  // 3. create a person to dodge and catch items and position at the bottom
  var robber = frame
    .asset(
      "https://raw.githubusercontent.com/karelrosseel/evadeherdt/master/falling/man.png"
    )
    .loc(game.width / 2, game.height, game);
  robber.reg(robber.width / 2, robber.height); // don't chain because we need the width of the object

  // 4. optionally start the game when the user moves their mouse or swipes
  stage.on("stagemousemove", startGame, null, true); // only once
  function startGame() {
    // 5. add a Ticker to run an animation function
    // note: Ticker consolidates and manages stage.updates
    Ticker.add(animate);

    // 6. call drop functions
    dropBombs();
    dropCoins();
  }

  // 7. make a createjs.Container for the dropped items

  // BOMBS
  var bombs = new Container();
  game.addChild(bombs);

  // 8. make the drop function to add a clone of the item to the container
  function dropBombs() {
    // 9. use a interval to randomly set the interval (and use requestAnimationFrame)
    interval([200, 1200], function () {
      var bomb = frame
        .asset(
          "https://raw.githubusercontent.com/karelrosseel/evadeherdt/master/falling/bomb.png"
        )
        .clone();
      bomb
        .reg(bomb.width / 2, bomb.height)
        .loc(rand(bomb.width, game.width - bomb.width), -10, bombs);

      var explosion = frame
        .asset(
          "https://raw.githubusercontent.com/karelrosseel/evadeherdt/master/falling/hit.png"
        )
        .clone();
      explosion.reg(explosion.width / 2, explosion.height - 10);
      bomb.explosion = explosion;
    });
  }

  // 7. make a createjs.Container for the dropped items

  // COINS
  var coins = new Container().addTo(game);

  // 8. make the drop function to add a clone of the item to the container
  // if you have lots of types of items then consider a function with parameters
  // and configuration arrays to handle asset, points, interval, speed, etc.
  function dropCoins() {
    // 9. use a interval to randomly set the interval (and use requestAnimationFrame)
    interval([500, 1500], function () {
      var coin = frame
        .asset(
          "https://raw.githubusercontent.com/karelrosseel/evadeherdt/master/falling/coin.png"
        )
        .clone();
      coin
        .reg(coin.width / 2, coin.height)
        .loc(rand(coin.width, game.width - coin.width), -10, coins);

      var wow = frame
        .asset(
          "https://raw.githubusercontent.com/karelrosseel/evadeherdt/master/falling/uitroep.png"
        )
        .clone();
      wow.reg(wow.width / 2, wow.height);
      coin.wow = wow;
    });
  }

  // 10. set a Damp object to handle damping the movement of the person
  // or could use the MotionController - but will show the type of code here...
  var damp = new Damp(null, 0.3);
  damp.immediate(robber.x);

  var speed = 10;
  function animate() {
    // 11. in the animate function move the person to the damped stage.mouseX
    robber.x = damp.convert(stage.mouseX - game.x);

    // 12. loop backwards through all the children of the falling item container
    loop(
      bombs,
      function (bomb) {
        // 13. move the item
        bomb.y += speed;
        // hitTestCircle would be better test but could bog depending...
        // if (robber.hitTestCircle(bomb)) {

        // 14. check to see of the item is hitting the player
        if (robber.hitTestBounds(bomb)) {
          // 15. if so then do whatever and remove the item from the container
          // lose game or take away life or points, play sound, etc.
          explode(bomb);
        }

        // 16. also check to see if item has fallen past the ground
        if (bomb.y >= game.height + 1) {
          explode(bomb);
        }
      },
      true
    ); // true loops backwards as we are removing children

    coins.loop(function (coin) {
      coin.y += speed;
      if (robber.hitTestBounds(coin)) {
        grab(coin);
        // get points etc.
      }
      if (coin.y >= game.height + coin.height + 10) {
        coin.wow = null;
        remove(coin); // our remove function at bottom of code
      }
    }, true); // true loops backwards as we are removing children
  }

  // 17. we can make little animations, etc. when things are hit
  function explode(bomb) {
    var explosion = bomb.explosion;
    if (explosion) {
      explosion.loc(bomb).animate({ alpha: 0 }, 100, null, remove, null, 100); // last param is wait
    }
    remove(bomb);

    // alternate closure for removing with setTimeout if performance issues
    // not in this simple case but there could be with hundreds of items
    // (function() {
    // 	var oldExplosion = explosion;
    // 	setTimeout(function(){
    // 		remove(oldExplosion);
    // 	}, 300)
    // }());
  }

  // 17. we can make little animations, etc. when things are hit
  function grab(coin) {
    coin.wow
      .addTo(game)
      .loc(coin.x, robber.y - robber.height - 20)
      .animate({ alpha: 0 }, 100, null, remove, null, 100); // last param is wait;
    remove(coin);
  }

  function remove(obj) {
    obj.removeFrom();
    obj = null;
  }
  
  // var label = new zim.Label("Bomnia", 30, null, xomnia_color).pos(40, 40);
  
  stage.update();

}); // end of ready