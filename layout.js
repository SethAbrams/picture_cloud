var maxCount;
var minCount;
var maxDim = 180;
var uniqueData;
var div1Width = 900;
var div1Height = 600;                

self.addEventListener("message", function(event){layout(event)}, false);

function layout(event){
    urlData = {};
    urlCounts = {};
    maxCount = 0;
    minCount = 0;
    var data = event.data.eventHistory;
    
    if(data.length === 0) {
        self.postMessage({"layoutResults":null});
        return;
    }
    
    data = cutDown(data);
    
    for(var i = 0; i < data.length; i++){
        urlData[data[i].url] = {
                                width: data[i].width,
                                height: data[i].height
                               };
                               
        if(urlCounts[data[i].url]){
                urlCounts[data[i].url]++;
        } else {
            urlCounts[data[i].url] = 1;
        }
    }
    
    uniqueData = [];
    
    for(var key in urlData){
        uniqueData.push({
            url: key,
            width: urlData[key].width,
            height: urlData[key].height,
            count: urlCounts[key]
           });
    }
    
    uniqueData.sort(function (a,b){return b.count - a.count;});
    maxCount = uniqueData[0].count;
    minCount = uniqueData[uniqueData.length - 1].count;
    uniqueData = normalizeDimensions(uniqueData);
    uniqueData[0].x = -uniqueData[0].width/2;
    uniqueData[0].y = -uniqueData[0].height/2;
    var x1 = uniqueData[0].x;
    var y1 = uniqueData[0].y;
    var x2 = uniqueData[0].x + uniqueData[0].width;
    var y2 = uniqueData[0].y + uniqueData[0].height;
    var step = Math.PI/1000;
    console.log(uniqueData.length);
    
    for(var i = 1; i < uniqueData.length; i++){
        uniqueData[i].x = -uniqueData[i].width/2;
        uniqueData[i].y = -uniqueData[i].height/2;
        var t = Math.random()*2*Math.PI;
        while(isHitting(i)){
            var coords = spiral(t);
            uniqueData[i].x = coords[0];
            uniqueData[i].y = coords[1];
            t += step;
        }

        x2 = Math.max(x2, uniqueData[i].x + uniqueData[i].width);
        x1 = Math.min(x1, uniqueData[i].x);
        y2 = Math.max(y2, uniqueData[i].y + uniqueData[i].height);
        y1 = Math.min(y1, uniqueData[i].y);
    }
     
    var bBoxCoords = [];
    bBoxCoords.push(x1);
    bBoxCoords.push(y1);
    bBoxCoords.push(x2);
    bBoxCoords.push(y2);
    
    
    var resultArray = [];
    resultArray.push(uniqueData);
    resultArray.push(bBoxCoords);
    self.postMessage({"layoutResults": resultArray});
};

var contains = function(obj, data){
    for(var i = 0; i < data.length; i++){
        if(data[i].url===obj.url){
            return true;
        }
    }
    return false;
};

var isOverlapping = function(image1, image2){ 
    return (image1.x - 2 < image2.x + image2.width && 
            image1.x + image1.width + 2 > image2.x &&
            image1.y - 2 < image2.y + image2.height && 
            image1.y + image1.height + 2 > image2.y);
};

var normalizeDimensions = function(data){
    for(var i = 0; i < data.length; i++){
        var largerDim;
        if(minCount === maxCount){
            largerDim = maxDim; 
        } else {
            largerDim = scale(data[i].count);
        }
        
        if(data[i].width < data[i].height){
            var origHeight = data[i].height;
            var origWidth = data[i].width;
            data[i].height = largerDim;
            data[i].width = (origWidth/origHeight)*largerDim;
        } else {
            var origWidth = data[i].width;
            var origHeight = data[i].height;
            data[i].width = largerDim;
            data[i].height = (origHeight/origWidth)*largerDim;
        }
    }
    return data;
};

var cutDown = function(data){
    return data.slice(0);
};

var scale = function(count){
    var slope = (maxDim)/(maxCount - minCount);
    return slope*count;
};

var isHitting = function(index){
  var isHitting = false;
  
  for(var i = 0; i < index; i++){
     if(isOverlapping(uniqueData[index], uniqueData[i])){
         isHitting = true;
     }
  }
  
  return isHitting;
};

 var spiral = function(t) {
    return [(div1Width/div1Height)*t*Math.cos(t), t*Math.sin(t)];
};
