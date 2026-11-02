import sys,cv2,numpy as np
src,out=sys.argv[1],sys.argv[2]
im=cv2.imread(src)
hsv=cv2.cvtColor(im,cv2.COLOR_BGR2HSV)
h,s,v=cv2.split(hsv)
yellow=((h>=18)&(h<=40)&(s>70)&(v>150)).astype(np.uint8)*255
mask=cv2.dilate(yellow,np.ones((3,3),np.uint8),iterations=3)
cv2.imwrite('/tmp/exxtools/img/mask.png',mask)
res=cv2.inpaint(im,mask,7,cv2.INPAINT_TELEA)
cv2.imwrite(out,res,[cv2.IMWRITE_JPEG_QUALITY,92])
print(im.shape, int((mask>0).sum()))
