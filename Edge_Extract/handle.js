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
        
        //vẽ từng frame hình lên canvas1 đồng thời thực hiện rút trích cạnh
        draw_and_extract_edge(this, context1, backcontext,  canvas1.width, canvas1.height);
        
    },false);
},false);


//vẽ từng frame hình lên canvas đồng thời thực hiện trích biên
function draw_and_extract_edge(vd, context, backcontext, width, height)
{
    if(vd.paused || vd.ended) return false;
    
    backcontext.drawImage(vd, 0, 0, width, height);
   
    var iData = backcontext.getImageData(0, 0, width, height);
    var pData = iData.data;
    var rData = iData.data;
   
  
    var i;
    var iPrev;
    var iNext;
    var dx, dy;
    var step = iData.width*4;

    //tính giá trị độ xám
    for (i=0; i<pData.length; i+=4)
    {                    
        var gray = pData[i]*0.3 + pData[i+1]*0.59 + pData[i+2]*0.11;
        pData[i] = gray;
    }
    
    //tính đạo hàm ảnh 
    var max = 0;
    var min = 255;
    var temp = []; //mảng tạm lưu giá trị đạo hàm
    for (i = 0; i < pData.length; i+=4)
    {
        if(i%4 == 3)
        {
            continue;
        }       
        
        iPrev = i - step;
        iNext = i + step;
        
        //đạo hàm theo phương ngang
        dx = Math.pow(pData[iNext - 4] - pData[iPrev - 4]
                      + 2*(pData[iNext] - pData[iPrev])
                      + pData[iNext + 4] - pData[iPrev + 4],2);
        //đạo hàm theo phương dọc
        dy = Math.pow(pData[iPrev + 4] - pData[iPrev - 4]
                      + 2*(pData[i + 4] - pData[i - 4])
                      + pData[iNext + 4] - pData[iNext - 4],2);
        //độ lớn vector gradient
        temp[i/4] = Math.sqrt(dx + dy);
        if(temp[i/4] > max)
        {
            max = temp[i/4];   
        }
        if (temp[i/4] < min)
        {
            min = temp[i/4];   
        }
    } 
    
    //so ngưỡng để lấy biên
    //var threshold = 0.2*(max - min) + min;
    for (i = 0; i < rData.length; i+=4)
    {
         if(i%4 == 3)
        {
            continue;
        }       
        

        if (temp[i/4] - min> 0) 
        {
            rData[i] = 255;
        }
        else
            rData[i] = 0;
        
        rData[i + 1] = rData[i];
        rData[i + 2] = rData[i];
    }
    
        
    iData.data = rData;
    context.putImageData(iData, 0, 0);

    
    //Xử lý frame kế tiếp
    setTimeout(draw_and_extract_edge, 0, vd, context, backcontext, width, height); 
}

