# Noted Markdown 

That might've been one of the shortest assignments in the history of Starfleet. Flair is what marks the difference between artistry and mere competence. What's a knock-out like you doing in a computer-generated gin joint like this? Many problems.

```coffeescript
    (canvas-img){width=780 height=500 keep-code=true}

    ctx.fillStyle = 'rgb(225,225,225)'
    ctx.fillRect(0,0,canvas.width,canvas.height)

    l = 7500
    for i in [0...l]
        n = i / l
        a = Math.PI * 0.125 + n * Math.PI * 1.75
        d = Math.random() * 200
        x = canvas.width * 0.5 + Math.cos(a) * d
        y = canvas.height * 0.5 + Math.sin(a) * d
        r = Math.random() * 2.5
        c = Math.floor(Math.random() * 255);
        
        ctx.fillStyle = 'rgb(' + c + ',' + c + ',' + c + ')'
        ctx.beginPath()
        ctx.arc(x,y,r,0,2*Math.PI);
        ctx.fill()
        
        log(a);
```
```js
    (canvas-img){width=780 height=300 keep-code=true render=false}
    
    //Draw
    ctx.fillStyle = 'rgba(225,225,225,10)';
    ctx.fillRect(0,0,canvas.width,canvas.height);
    
    for(var i = 0, l = 50000; i < l; ++i){
        var color = Math.floor(Math.random() * 255);
        ctx.fillStyle = 'rgb(' + color + ',' + color + ',' + color + ')';
            
        ctx.fillRect(
            (i/l) * canvas.width, 
            (1.0 - (0.5 + Math.sin((1.0 - i / l) * Math.PI * 4) * 0.5) * Math.random() * (0.5 + Math.sin(i/l * Math.PI * 12) * 0.5)) * canvas.height,
            1, 1
        );
    }
```
```javascript
    (canvas-img){width=780 height=200 keep-code=false render=false}
    
    //Draw
    ctx.fillStyle = '#111';
    ctx.fillRect(0,0,canvas.width,canvas.height);
    
    var data = new Array(256);
    var total = 0;
    var highest = 0;
    
    for(var i = 0, l = data.length; i < l; ++i){
        data[i] = Math.random();
        highest = Math.max(data[i],highest);
        total  += data[i];
    }
    
    ctx.fillStyle = '#fff';
    
    var padding = 15;
    var width   = canvas.width - padding * 2;
    var height  = canvas.height - padding * 2;
    var step    = width / data.length;
    
    for(var i = 0, l = data.length; i < l; ++i){
        var n = i / l;
        var r = Math.floor(n * 255);
        var g = 0;
        var b = Math.floor((1-n) * 255);
        ctx.fillStyle = 'rgb(' + r + ',' + g + ',' + b + ')';
        ctx.fillRect(padding + i * step, padding + height, step, (data[i]/highest) * (height) * -1);
    }
```
*Some inline rendered javascript displaying canvas*

**List saying something:**
- Its good to have lines auto-intending if they wrap
- Another important point

## Sub-Heading

Sure. You'd be surprised how far a hug goes with Geordi, or Worf. I guess it's better to be lucky than good. Captain, why are we out here chasing comets?

```js
    (canvas-img){width=780 height=300 render=false}
    
    //Draw
    ctx.fillStyle = '#111';
    ctx.fillRect(0,0,canvas.width,canvas.height);
    
    for(var i = 0, l = 20000; i < l; ++i){
        var color = Math.floor(Math.random() * 255);
        ctx.fillStyle = 'rgb(' + color + ',' + color + ',' + color + ')';
            
        ctx.fillRect(
            (i/l) * canvas.width, 
            (1.0 - (0.5 + Math.sin((1.0 - i / l) * Math.PI * 4) * 0.5) * Math.random() * (0.5 + Math.sin(i/l * Math.PI * 12) * 0.5)) * canvas.height,
            1, 1
        );
    }
```
*Some inline rendered javascript displaying canvas*