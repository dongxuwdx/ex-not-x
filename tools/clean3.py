import sys,cv2,numpy as np
im=cv2.imread(sys.argv[1]);out=sys.argv[2]
med=cv2.medianBlur(im,9).astype(int);d=im.astype(int)-med
dB,dG,dR=d[...,0],d[...,1],d[...,2]
hsv=cv2.cvtColor(im,cv2.COLOR_BGR2HSV);h,s,v=cv2.split(hsv)
green=cv2.dilate(((h>=38)&(h<=95)&(s>50)).astype(np.uint8),np.ones((9,9),np.uint8))
cand=((dR>12)&(dG>12)&(dG>dB+10)&(green==0)).astype(np.uint8)*255
n,lbl,stats,_=cv2.connectedComponentsWithStats(cand,8)
mask=np.zeros_like(cand)
for i in range(1,n):
  x,y,w,hh,a=stats[i]
  if a>=6 and a<3000: mask[lbl==i]=255
mask=cv2.dilate(mask,np.ones((3,3),np.uint8),iterations=2)
cv2.imwrite('/tmp/exxtools/img/mask3.png',mask)
cv2.imwrite(out,cv2.inpaint(im,mask,5,cv2.INPAINT_TELEA),[cv2.IMWRITE_JPEG_QUALITY,92])
print(int((mask>0).sum()))
