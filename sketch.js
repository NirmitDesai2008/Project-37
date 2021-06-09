var database;
var dog, dogImage, happyDogImage;
var foodS, foodStock;
var feedTime, lastFeed;
var feed, addFood;
var milk;
var gameState, readState;
var bedroomImage, gardenImage, washroomImage;

function preload(){
  dogImage = loadImage("images/dog.png");
  happyDogImage = loadImage("images/happyDog.png");
  bedroomImage = loadImage("images/Bedroom.png");
  gardenImage = loadImage("images/Garden.png");
  washroomImage = loadImage("images/Washroom.png");
}

function setup(){
	database = firebase.database(); 
  createCanvas(800,645);

  milk = new Food();
  
  foodStock = database.ref('Food');
  foodStock.on("value",readStock);

  dog = createSprite(650,270,150,150);
  dog.addImage(dogImage);
  dog.scale = 0.3;
  
  feed = createButton("Feed the Dog");
  feed.position(500,40);
  feed.mousePressed(feedDog);

  addFood = createButton("Add Food");
  addFood.position(600,40);
  addFood.mousePressed(addFoods);

  readState = database.ref('gameState');
  readState.on("value",function(data){
    gameState = data.val();
  });
}

function draw(){
  background(46,139,87);

  currentTime = hour();
  if (currentTime == (lastFeed+1)){
    update("playing");
    milk.garden();
  } else if (currentTime == (lastFeed+2)){
    update("sleeping");
    milk.bedroom();
  } else if (currentTime > (lastFeed+2) && currentTime <= (lastFeed+4)){
    update("bathing");
    milk.washroom();
  } else {
    update("hungry");
    milk.display();
  }

  feedTime = database.ref('FeedTime');
  feedTime.on("value",function(data){
    lastFeed = data.val();
  });

  fill("black");
  textSize(20);
  if (lastFeed >= 12){
    text("Last Feed : "+lastFeed % 12+" PM",280,60);
  } else if (lastFeed == 0){
    text("Last Feed : 12 AM",280,60);
  } else {
    text("Last Feed : "+lastFeed+" AM",280,60);
  }

  if (gameState != "hungry"){
    feed.hide();
    addFood.hide();
    dog.remove();
  } else {
    feed.show();
    addFood.show();
    dog.addImage(dogImage);
  }
  drawSprites();
}

function readStock(data){
  foodS = data.val();
  milk.updateFoodStock(foodS);
}

function feedDog(){
  dog.addImage(happyDogImage);

  if (milk.getFoodStock() <= 0){
    milk.updateFoodStock(milk.getFoodStock()*0);
  } else {
    milk.updateFoodStock(milk.getFoodStock()-1);
  }    
  
  database.ref('/').update({
    Food: milk.getFoodStock(),
    FeedTime: hour()
  });
}

function addFoods(){
  foodS++;
  database.ref('/').update({
    Food: foodS
  });
}

function update(state){
  database.ref('/').update({
    gameState: state
  });
}