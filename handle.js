document.addEventListener('DOMContentLoaded', function () {
    var vd = document.getElementById('v');
    
    var canvas1 = document.getElementById('c1');
    //var canvas2 = document.getElementById('c2');
    var context1  = canvas1.getContext('2d');
    //var context2 = canvas2.getContext('2d');
    var back = document.createElement('canvas');
    var backcontext = back.getContext('2d');
    
    
    //xử lý sự kiện play
    vd.addEventListener('play', function () {
        //gán size của video cho canvas         
        canvas1.width = vd.clientWidth;
        canvas1.height = vd.clientHeight;
        //canvas2.width = vd.clientWidth;
       // canvas2.height = vd.clientHeight;
        back.width = vd.clientWidth;
        back.height = vd.clientHeight;
        
        //vẽ từng frame hình lên canvas1 đồng thời thực hiện làm mờ trung bình
        draw_and_extract_edge(this, context1, backcontext,  canvas1.width, canvas1.height);
        
        //vẽ từng frame hình lên canvas2 đồng thời thực hiện lấy biên cạnh
        //draw_and_extract_edge(this, context2, backcontext,  canvas2.width, canvas2.height);
    },false);
},false);



////vẽ từng frame hình lên canvas đồng thời thực hiện làm mờ trung bình
//function draw_and_blur(vd, context, backcontext, width, height)
//{
//    if(vd.paused || vd.ended) return false;
//    
//    backcontext.drawImage(vd, 0, 0, width, height);
//   
//    var iData = backcontext.getImageData(0, 0, width, height);
//    var pData = iData.data;
//    var rData = iData.data;
//   
//    var step = iData.width*4;
// 
//    var i;
//    var iPrev;
//    var iNext;
//    for (i = 0; i < pData.length; i++)
//    {
//        if(i%4 == 3)
//        {
//            continue;
//        }       
//        
//        iPrev = i - step;
//        iNext = i + step;
//        rData[i] = (pData[iPrev-4] + pData[iPrev] + pData[iPrev+4]
//                    + pData[i-4] + pData[i] + pData[i+4]
//                    + pData[iNext-4] + pData[iNext] + pData[iNext+4])/9.0;
//    }    
//    
//        
//    iData.data = rData;
//    context.putImageData(iData, 0, 0);
//
//    
//    //Xử lý frame kế tiếp
//    setTimeout(draw_and_blur, 10, vd, context, backcontext, width, height); 
//}

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
    
    var threshold = 0.2*(max - min) + min;
    for (i = 0; i < rData.length; i+=4)
    {
         if(i%4 == 3)
        {
            continue;
        }       
        

        if (temp[i/4] - min >= threshold) 
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
    setTimeout(draw_and_extract_edge, 20, vd, context, backcontext, width, height); 
}

////Video processing-------------------------------------------------------------------------------------------------------------------
////Convolute with kernel 3x3
//function convolute(iData, kernel, delta)
//{
//    var w = iData.width;    
//    var pData = iData.data;
//    var rData = iData.data;
//    var length = pData.length;
//    var i;
//    var step = w*4;
//    
//    for (i=0; i<length; i++)
//    {
//        if(i%4 == 3)
//        {
//            continue;
//        }       
//        
//        iPrev = i - step;
//        iNext = i + step;
//        pData[i] = rData[iPrev-4]*kernel[8] + rData[iPrev]*kernel[7] + rData[iPrev+4]*kernel[6]
//                    + rData[i-4]*kernel[5] + rData[i]*kernel[4] + rData[i+4]*kernel[3]
//                    + rData[iNext-4]*kernel[2] + rData[iNext]*kernel[1] + rData[iNext+4]*kernel[0] + delta;
//    }    
//    iData.data = pData;
//}
//
////Edge detection
//function edgeDetect(frameData)
//{
//    var iData = frameData;
//    
//    var kernel = [0, -1, 0,
//                 -1, 2, 0,
//                 0, 0, 0];
//    
//    convolute(iData, kernel, 100);
//    
//    return iData;
//}
//
////Gaussian blur
//function gaussBlur(frameData)
//{
//    var iData = frameData;
//    
//    var kernel = [0.0625, 0.125, 0.0625,
//                 0.125, 0.25, 0.125,
//                 0.0625, 0.125, 0.0625];
//    
//    convolute(iData, kernel, 0);
//    
//    return iData;
//}
//
////Grayscale
//function grayscale(frameData)
//{
//    var iData = frameData;
//    var pData = iData.data;
//    
//    //Acess all pixels and grayscale them
//    var length = pData.length;
//    for (var i=0; i<length; i+=4)
//    {                    
//        var gray = pData[i]*0.3 + pData[i+1]*0.59 + pData[i+2]*0.11;
//        pData[i] = gray;
//        pData[i+1] = gray;
//        pData[i+2] = gray;
//    }
//    
//    iData.data = pData;
//    return iData;
//}
//
////Video controller-------------------------------------------------------------------------------------------------------------------
////Play video
//function playVid()
//{
//    var v = document.getElementById('video');
//    var but = document.getElementById('playBut');
//    if (v.paused)
//    {
//        v.play();
//        but.textContent = 'PAUSE';
//    }
//    else
//    {
//        v.pause();
//        but.textContent = 'PLAY';
//    }
//}
//
////Pause video
//function replayVid()
//{
//    var v = document.getElementById('video');
//    v.currentTime = 0;
//}
//
////Change filter
//function changeFilter()
//{
//    var fTxt = document.getElementById('filterText');
//    
//    if(filter == 1)
//    {
//        filter++;
//        fTxt.innerHTML = 'Edge Detection';
//    }
//    else if(filter == 2)
//    {
//        filter++;
//        fTxt.innerHTML = 'Gaussian Blur with 3x3 kernel';
//    }
//    else if(filter == 3)
//    {
//        filter = 1;
//        fTxt.innerHTML = 'Grayscale';
//    }
//}
//
//
//
//
//
//
//
//
//////Convolute with kernel 3x3
////function convolute(iData, hKernel, vKernel, mean)
////{
////    var w = iData.width;    
////    var pData = iData.data;
////    var pData2 = iData.data;
////    var length = pData.length;
////    var i;
////    var step = w*4;
////    
////    //Horizontal filtering
////    for (i=0; i<length; i++)
////    {
////        if(i%4 == 3)
////        {
////            continue;
////        }        
////        pData2[i] = pData[i-4]*hKernel[2] + pData[i]*hKernel[1] + pData[i + 4]*hKernel[0] + mean;        
////    }
////    
////    //Vertical filtering
////    for (i=0; i<length; i++)
////    {
////        if(i%4 == 3)
////        {
////            continue;
////        }        
////        pData[i] = pData2[i-step]*vKernel[2] + pData2[i]*vKernel[1] + pData2[i + step]*vKernel[0] + mean;      
////    }
////    
////    iData.data = pData;
////}