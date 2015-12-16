```js
    (canvas-img){width=780 height=300 keep-code=false render=true}
   
    ctx.fillStyle = '#CDCDCD';
    ctx.fillRect(0,0,canvas.width,canvas.height);
   
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(canvas.width * 0.5,canvas.height*0.5,100,0,2*Math.PI);
    ctx.fill();
```
*img js*


```js
    (canvas-gif){width=780 height=300 keep-code=false fps=30 duration=1000 render=false}
    
    ctx.fillStyle = '#CDCDCD';
    ctx.fillRect(0,0,canvas.width,canvas.height);
    
    var n = frame / numFrames;
    var r = n * 100;
    var x = canvas.width * 0.5 + Math.sin(n * Math.PI * 2) * 200;
    
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(x,canvas.height*0.5,r,0,2*Math.PI);
    ctx.fill();
```
*gif js – press "render gif"*

```js
    (svg){width=780 height=300 keep-code=false render=true}
    
    svgNode.style.background = '#CDCDCD';
    
    var width  = +svgNode.getAttribute('width');
    var height = +svgNode.getAttribute('height');
    
    var circle = document.createElementNS(
        'http://www.w3.org/2000/svg','circle'
    );
    circle.setAttribute('cx',width * 0.5);
    circle.setAttribute('cy',height * 0.5);
    circle.setAttribute('r', 100);
    
    svgNode.appendChild(circle);
```
*svg js*

```coffee
    (canvas-img){width=780 height=300 keep-code=false render=true}
    
    ctx.fillStyle = '#CDCDCD'
    ctx.fillRect(0,0,canvas.width,canvas.height)
    
    ctx.fillStyle = '#000'
    ctx.beginPath()
    ctx.arc(canvas.width * 0.5,canvas.height * 0.5,100,0,2*Math.PI)
    ctx.fill()
```
*img coffee*

```coffee
    (canvas-gif){width=780 height=300 keep-code=false fps=30 duration=1000 render=false}
    
    ctx.fillStyle = '#CDCDCD'
    ctx.fillRect(0,0,canvas.width,canvas.height)
    
    n = frame / numFrames
    r = n * 100
    x = canvas.width * 0.5 + Math.sin(n * Math.PI * 2) * 200
    
    ctx.fillStyle = '#000'
    ctx.beginPath()
    ctx.arc(x,canvas.height*0.5,r,0,2*Math.PI)
    ctx.fill()
```
*gif coffee – press "render gif"*

```coffee
    (svg){width=780 height=300 keep-code=false render=true}
    
    svgNode.style.background = '#CDCDCD';
    
    width  = +svgNode.getAttribute('width');
    height = +svgNode.getAttribute('height');
    
    circle = document.createElementNS(
        'http://www.w3.org/2000/svg','circle'
    );
    circle.setAttribute('cx',width * 0.5);
    circle.setAttribute('cy',height * 0.5);
    circle.setAttribute('r', 100);
    
    svgNode.appendChild(circle);
```
*svg coffe*





