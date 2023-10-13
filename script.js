var scaling = "fit";
var width = 1400;
var height = 800;
var color = white;
var outerColor = white;
var xomnia_color = '#2d4d9d';
var beersCaught = 0;
var highScore = 0;

var assets = [
  "https://raw.githubusercontent.com/karelrosseel/evadeherdt/master/falling/bomb.png",
  "https://raw.githubusercontent.com/karelrosseel/evadeherdt/master/falling/hit.png",
  "https://raw.githubusercontent.com/karelrosseel/evadeherdt/master/falling/uitroep.png",
  "https://raw.githubusercontent.com/karelrosseel/evadeherdt/master/falling/man.png",
  "bomnia_transparant.png",
  "beer.png",
  // {id: "counterLabel", type: "label", text: "Beers Caught: 0", font: "20px Arial", color: xomnia_color},
  // {id: "highScoreLabel", type: "label", text: "High Score: 0", font: "20px Arial", color: xomnia_color}
];
var path = "assets/";

var frame = new zim.Frame(scaling, width, height, color, outerColor, assets);

frame.on("ready", function () {
  zog("ready from ZIM Frame");
  
  // Create and display the counter and high score labels
  var counterLabel = new zim.Label("Beers Caught: 0", 20, null, xomnia_color).pos(40, 55);
  var highScoreLabel = new zim.Label("High Score: 0", 20, null, xomnia_color).pos(40, 75);

  var stage = frame.stage;
  var stageW = frame.width;
  var stageH = frame.height;
  
  
  // STEPS
  // 1. create a backing that can be used as a mask (or just go full screen)
  var backing = new Rectangle(stageW - 80, stageH - 250, white)
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
    dropbeers();
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

  // beerS
  var beers = new Container().addTo(game);

  // 8. make the drop function to add a clone of the item to the container
  // if you have lots of types of items then consider a function with parameters
  // and configuration arrays to handle asset, points, interval, speed, etc.
  function dropbeers() {
    // 9. use a interval to randomly set the interval (and use requestAnimationFrame)
    interval([500, 1500], function () {
      var beer = frame
        .asset(
          // "https://raw.githubusercontent.com/karelrosseel/evadeherdt/master/falling/beer.png"
          "beer.png"
        )
        .clone();
      beer
        .reg(beer.width / 2, beer.height)
        .loc(rand(beer.width, game.width - beer.width), -10, beers);
      beer.scaleX = 0.2;
      beer.scaleY = 0.2;

      var wow = frame
        .asset(
          "https://raw.githubusercontent.com/karelrosseel/evadeherdt/master/falling/uitroep.png"
        )
        .clone();
      wow.reg(wow.width / 2, wow.height);
      beer.wow = wow;
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
          beersCaught = 0; // Reset the counter to zero when a bomb is hit
          updateCounter();
        }

        // 16. also check to see if item has fallen past the ground
        if (bomb.y >= game.height + 1) {
          explode(bomb);
        }
      },
      true
    ); // true loops backwards as we are removing children

    // beers.loop(function (beer) {
    //   beer.y += speed;
    //   if (robber.hitTestBounds(beer)) {
    //     grab(beer);
    //     // get points etc.
    //   }
    //   if (beer.y >= game.height + beer.height + 10) {
    //     beer.wow = null;
    //     remove(beer); // our remove function at bottom of code
    //   }
    // }, true); // true loops backwards as we are removing children


    beers.loop(function (beer) {
      beer.y += speed;
      if (robber.hitTestBounds(beer)) {
          grab(beer);
          beersCaught++;
          updateCounter();
          // Check if the current score is higher than the high score
          if (beersCaught > highScore) {
              highScore = beersCaught;
              updateHighScore();
          }
      }
      if (beer.y >= game.height + beer.height + 10) {
          beer.wow = null;
          remove(beer);
      }
    }, true);
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
  function grab(beer) {
    beer.wow
      .addTo(game)
      .loc(beer.x, robber.y - robber.height - 20)
      .animate({ alpha: 0 }, 100, null, remove, null, 100); // last param is wait;
    remove(beer);
  }

  function updateCounter() {
    counterLabel.text = "Beers Caught: " + beersCaught;
  }

  function updateHighScore() {
      highScoreLabel.text = "High Score: " + highScore;
  }

  function remove(obj) {
    obj.removeFrom();
    obj = null;
  }
  
  stage.update();

}); // end of ready