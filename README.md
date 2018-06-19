# counter-in-24h
an string counter in one day, contains date note

### 简述
不同的服务或许会调用同一id生成器:如,战斗服房间id生成器需调用同一id生成器,来统计当天某类型的战斗一共开了多少场.
ok,实现这一需求的方案或许有很多种,但无论哪种实现方案.房间本身都是需要id标识的.那我直接将统计放入了房间id的生成中.
### 特点
多服共用,利用redis.
### 实现简述
利用redis的hash,固定key:COUNTER:IN:24H,field客户自定义(最终能转str就好),值是 某天_count.
### 安装 
