var userNames = ["ESL_SC2", "OgamingSC2", "cretetion", "freecodecamp", "storbeck", "habathcx", "RobotCaleb", "noobs2ninjas","beohoff","brunofin", "comster404"];
function Channel(newname){
  this.displayName="";
  this.name=newname;
  this.status="";
  this.logo="";
  this.bio="";
  this.streamGame="";
  this.streamPreview="";
  this.channel_status="";
  this.createdDate="";
  this.channel_url="";
  this.visible=false;
}
Channel.prototype.getName = function(){
    return this.name;
  };
Channel.prototype.getDisplayName = function(){
    return this.displayName;
  };
Channel.prototype.getStatus = function(){
    return this.status;
  };
Channel.prototype.getLogo = function(){
    return this.logo;
  };
Channel.prototype.getbio = function(){
    return this.bio;
  };
Channel.prototype.getStreamGame = function(){
    return this.streamGame;
  };
Channel.prototype.getStreamPreview = function(){
  return this.streamPreview;
 };
Channel.prototype.getChannelStatus = function(){
    return this.channel_status;
  };
Channel.prototype.getCreatedDate = function(){
    return this.createdDate;
  };
Channel.prototype.getChannelURL = function(){
  return this.channel_url;
}
Channel.prototype.getVisible = function(){
  return this.visible;
}

var users = [];
var twitchURL = "https://api.twitch.tv/kraken/";
var onlineCount = 0;
var offlineCount = 0;
var inactiveCount = 0;
var totalUsers = 0;

/* Document Ready Function...
   Kicks off getUsers
*/
$(document).ready( function(){
  getUsers( userNames );

  $("#onlineCount").on("click", function(){
    filterUsers("online");
  });
  $("#offlineCount").on("click", function(){
    filterUsers("offline");
  });
  $("#deletedCount").on("click", function(){
    filterUsers("deleted");
  });
  $("#totalCount").on("click", function(){
    filterUsers(["online","offline","deleted"]);
  });

  $(document).on("click", "#close", function(){
    var id = "#" + $(this).parent().closest(".panel").attr('id');
    //update counts and arrays
    var name = id.substring( id.indexOf('-')+1);
    for( i=0; i<users.length; i++){
      if (users[i].getName() == name){
        users.splice( i, 1);
        $(id).remove();
      }
    }
    displayCount();

  });

  $("#srchSubmit").on({
    click:function(){
      search = [];
      found=false;
      newVal = $("#channelSearch").val();
      for( i=0;i<users.length;i++){
        if (users[i].getName() == newVal){
          found=true;
        }
      }
      if (found === false){
        search.push( newVal );
        getUsers(search);
      } else {
        $("#channelSearch").val("User is already displayed");
      }
    }
  });
  $("#channelSearch").on({ focus:function(){
    $(this).val("");
  }});
});

/* Starter function to take a prepared list of usernames and get
Twitch data about them.  Later we can expand/delete this list */
function getUsers( userNames ){
  var deferreds = [];
  for (i=0; i<userNames.length; i++){
    var temp = new Channel(userNames[i]);
    users.push(temp);
    var ajax = getUserData(temp);
    deferreds.push(ajax);
    var ajax2 = getStream(temp);
    deferreds.push(ajax2);
  }
  $.when.apply($, deferreds).then(function() {
        displayUsers();
    });
}
/* This function calls the twitch API for a Channel object (to get user data).
Each Channel object gets a unique API call.  If successful,
the function will update the Channel object with the user properties;
Errors will be logged to the console */
function getUserData( myUser ){
  userURL = twitchURL + "users/" + myUser.getName();
    var deferred = $.ajax(
      { url: userURL,
        dataType: "jsonp"
      })
      .done( function(data){
        console.log(JSON.stringify(data));
        if (data["error"] == "Not Found"){
          for( i=0; i<users.length; i++){
            if (myUser.getName() == users[i].getName() ){
              users.splice( i, 1);
              console.log( users.length);
            }
          }
          $("#channelSearch").val("User does not exist");

        } else {}
          myUser.displayName = data["display_name"];
          myUser.createdDate = data["created_at"];
          myUser.channel_url = "https:///www.twitch.tv/" + data["name"];
          if (data.hasOwnProperty("bio")){
            myUser.bio = data["bio"];
          }
          if (data.hasOwnProperty("logo")){
            myUser.logo = data["logo"];
          }
      })
      .fail( function(err){
        console.log(err);
      });

    return deferred;
}

/* This function will retrieve a Twitch stream for a given user.
If the stream is not null, the user is considered "online"
If the stream is null, the user is considered "offline"
If the call returns an error, the user is considered "deleted"
*/
function getStream(myUser){
  streamURL = twitchURL + "streams/" + myUser.getName();
  console.log(streamURL);

  var deferred = $.ajax(
      { url: streamURL,
        dataType: "jsonp"
      })
      .done( function(stream){
        console.log(JSON.stringify(stream));
        if (stream.hasOwnProperty("error")){
          myUser.status = "deleted";
        } else {
          if (stream["stream"] == null){
            myUser.status = "offline";
            myUser.streamGame = "<em>Offline</em>"
          } else {
              myUser.status="online";
              console.log(stream["stream"]["game"]);
              myUser.streamGame = stream["stream"]["game"];
              myUser.streamPreview = stream["stream"]["preview"]["medium"];
          }
        }
      })
      .fail( function(err){
        console.log(err);
      });
      return deferred;
}
/* Display user data from a Twitch user API call. Data is displayed
in a collapsible panel, with an HREF value of the user name.  This
function will include the Logo, Display_Name and Bio of the user
(if applicable).
After collecting the HTML, it will call function to update the status bars
*/
function displayUsers(){
  for (i=0; i<users.length; i++){
    if( users[i].getVisible() !== true ){
      myHTML = createUserPanel(users[i]);
      users[i].visible=true;
      $("#users").append(myHTML);
    }
  }

  displayCount();
}

function createUserPanel(user){
  var body=false;
  myHTML = '<div class="panel panel-default" id="panel-' + user.getName() + '"><div class="panel-heading">';
  myHTML += '<h4 class="panel-title"><a data-toggle="collapse" href="#' + user.getDisplayName() + '"><button class="btn btn-circle ';
  switch( user.getStatus() ){
    case "online":
      myHTML += "btn-success";
      break;
    case "offline":
      myHTML += "btn-warning";
      break;
    case "deleted":
      myHTML += "btn-danger";
      break;
  }
  myHTML += '" id="btn-' + user.getName() + '">';
  myHTML += '<i class="fa fa-plus" id="expand"></i></button></a><i class="fa fa-close fa-2x fa-pull-right" id="close"></i>';
  //myHTML += '</a>';
  myHTML += '<a href="' + user.getChannelURL() + '" target="_blank">';
  if ( user.getLogo() !== null){
    myHTML += '<img class="logo" src="' + user.getLogo() + '"/>';
  } else {
    myHTML += '<img class="logo" src="twitch_logo2.png"/>';
  }
  myHTML += ' ' + user.getDisplayName() + ' </a></h4></div>';  //ends panel-heading

  if (user.getStatus() == "online"){
    body=true;
    myHTML += '<div id="' + user.getDisplayName() +'" class="panel-collapse collapse">';
    myHTML += '<div class="panel-body"><a href="' + user.getChannelURL() + '" target="_blank"><strong>Now Streaming: ' + user.getStreamGame() + '</strong>';
    myHTML += '<img class="img img-responsive pull-right" src="' + user.getStreamPreview() + '"/>"</a></div>';
  } else if (user.getStatus() == "offline"){
    body=true;
    myHTML += '<div id="' + user.getDisplayName() +'" class="panel-collapse collapse">';
    myHTML += '<div class="panel-body"><strong>Now Streaming: </strong>' + user.getStreamGame() + '</div>';    
  }

  if ( user.getbio() !== null && user.getbio().length > 0){
    if (body==false){
      myHTML += '<div id="' + user.getDisplayName() +'" class="panel-collapse collapse">';
      body=true;
    }
    myHTML += '<div class="panel-body"><b>Bio</b>: ' + user.getbio() + '</div>';
  }
  if (body==false){
    myHTML += '<div id="' + user.getDisplayName() +'" class="panel-collapse collapse">';
    body=true;
  }
  myHTML += '<div class="panel-footer">Streaming since ' + user.getCreatedDate().substring(0,10) + '</div>';
  if (body === true){
    myHTML+= '</div>';  //ends panel collapse
  }
  myHTML += '</div>'; //ends panel div
  console.log(myHTML);
  return myHTML;
}

function displayCount(){
  onlineCount = 0;
  offlineCount = 0;
  inactiveCount = 0;
  totalUsers = 0;

  for( i=0; i<users.length; i++){
    switch( users[i].getStatus() ){
      case "online":
        onlineCount++;
        totalUsers++;
        break;
      case "offline":
        offlineCount++;
        totalUsers++;
        break;
      case "deleted":
        inactiveCount++;
        totalUsers++;
        break;
    }
  }
  $("#onlineCount").html(onlineCount);
  $("#offlineCount").html(offlineCount);
  $("#deletedCount").html(inactiveCount);
  $("#totalCount").html(totalUsers);
}

function filterUsers( filter ){
  for( i=0; i<users.length; i++){
    console.log(filter.indexOf(users[i].getStatus()));

    if( filter.indexOf(users[i].getStatus() ) <0 ){
      if( users[i].getVisible() === true ){
        $("#panel-"+users[i].getName()).remove();
        users[i].visible=false;
      }
    } else {
        if (users[i].getVisible() === false){
          $("#users").append( createUserPanel(users[i]));
          users[i].visible = true;
        }
      }
    }
}
/*
<div class="panel panel-default" id="panel-ESL_SC2">
  <div class="panel-heading">
    <h4 class="panel-title">
    <a data-toggle="collapse" href="#ESL_SC2">
      <button class="btn btn-circle btn-success" id="btn-ESL_SC2">
        <i class="fa fa-plus" id="expand">
        </i>
      </button>
    </a>
    <i class="fa fa-close fa-2x fa-pull-right" id="close">
    </i>
    <a href="https:///www.twitch.tv/esl_sc2" target="_blank">
      <img class="logo" src="https://static-cdn.jtvnw.net/jtv_user_pictures/esl_sc2-profile_image-d6db9488cec97125-300x300.jpeg"/> ESL_SC2
    </a>
    </h4>
  </div>
  <div id="ESL_SC2" class="panel-collapse collapse">
    <div class="panel-body">
      <a href="https:///www.twitch.tv/esl_sc2" target="_blank">
        <strong>Now Streaming: StarCraft II</strong>
        <img class="img img-responsive pull-right" src="https://static-cdn.jtvnw.net/previews-ttv/live_user_esl_sc2-320x180.jpg/>"</a></div><div class="panel-body"><b>Bio</b>: For standings, schedule, and results, visit http://www.intelextrememasters.com/</div><div class="panel-footer">Streaming since 2012-05-02</div></div></div>
*/
