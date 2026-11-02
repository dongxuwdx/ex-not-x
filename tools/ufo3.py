import cv2,numpy as np
im=cv2.imread('/tmp/exxtools/img/desert3.jpg')
S=4;H,W=im.shape[:2];m=np.zeros((H*S,W*S),np.uint8)
P=lambda pts:(np.array(pts)*S).astype(np.int32)
cv2.ellipse(m,(795*S,285*S),(67*S,47*S),0,180,360,255,-1)
cv2.fillPoly(m,[P([(628,313),(700,296),(733,285),(858,285),(892,293),(958,313),(958,318),(628,318)])],255)
cv2.ellipse(m,(793*S,317*S),(166*S,21*S),0,0,180,255,-1)
cv2.ellipse(m,(793*S,343*S),(73*S,16*S),0,0,360,255,-1)
m=cv2.resize(m,(W,H),interpolation=cv2.INTER_AREA)
X0,Y0,X1,Y1=618,230,968,366
rgba=cv2.cvtColor(im[Y0:Y1,X0:X1],cv2.COLOR_BGR2BGRA);rgba[...,3]=m[Y0:Y1,X0:X1]
cv2.imwrite('/tmp/exxtools/img/ufo.png',rgba)
hole=cv2.dilate((m>0).astype(np.uint8)*255,np.ones((19,19),np.uint8))
cv2.imwrite('/tmp/exxtools/img/desert-noufo.jpg',cv2.inpaint(im,hole,13,cv2.INPAINT_TELEA),[cv2.IMWRITE_JPEG_QUALITY,90])
u=rgba;bg=np.full(u.shape[:2]+(3,),(60,200,60),np.uint8);a=u[...,3:]/255;cv2.imwrite('/tmp/exxtools/img/ufo_check.png',cv2.resize((u[...,:3]*a+bg*(1-a)).astype('uint8'),None,fx=2,fy=2))
cv2.imwrite('/tmp/exxtools/img/crop.jpg',cv2.imread('/tmp/exxtools/img/desert-noufo.jpg')[150:520,520:1080])
print('ufo box',X0,Y0,X1,Y1)
