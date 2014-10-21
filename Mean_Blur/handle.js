document.addEventListener('DOMContentLoaded', function () {
    var vd = document.getElementById('v');
    
    var canvas1 = document.getElementById('c1');
    var context1  = canvas1.getContext('2d');
    var back = document.createElement('canvas');
    var backcontext = back.getContext('2d');
    
    
    //xử lý sự kiện play
    vd.addEventListener('play', function () {
        //gán size của video cho canvas         
        canvas1.width = vd.clientWidth;
        canvas1.height = vd.clientHeight;
        back.width = vd.clientWidth;
        back.height = vd.clientHeight;
        
        //vẽ từng frame hình lên canvas1 đồng thời thực hiện làm mờ trung bình
        draw_and_blur(this, context1, backcontext,  canvas1.width, canvas1.height);
        
    },false);
},false);



//vẽ từng frame hình lên canvas đồng thời thực hiện làm mờ trung bình
function draw_and_blur(vd, context, backcontext, width, height)
{
    if(vd.paused || vd.ended) return false;
    
    backcontext.drawImage(vd, 0, 0, width, height);
   
    var iData = backcontext.getImageData(0, 0, width, height);
    var pData = iData.data;
    var rData = iData.data;
   
    var step = iData.width*4;
 
    var i;
    var iPrev;
    var iNext;
    for (i = 0; i < pData.length; i++)
    {
        if(i%4 == 3)
        {
            continue;
        }       
        
        iPrev = i - step;
        iNext = i + step;
        rData[i] = (pData[iPrev-4] + pData[iPrev] + pData[iPrev+4]
                    + pData[i-4] + pData[i] + pData[i+4]
                    + pData[iNext-4] + pData[iNext] + pData[iNext+4])/9.0;
    }    
    
        
    iData.data = rData;
    context.putImageData(iData, 0, 0);

    
    //Xử lý frame kế tiếp
    setTimeout(draw_and_blur, 10, vd, context, backcontext, width, height); 
}

