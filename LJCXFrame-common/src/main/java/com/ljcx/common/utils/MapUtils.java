package com.ljcx.common.utils;

import java.beans.BeanInfo;
import java.beans.Introspector;
import java.beans.PropertyDescriptor;
import java.lang.reflect.Method;
import java.util.*;


/**
 * Map工具类
 *
 */
public class MapUtils {

    /**
     * 从map集合中获取属性值
     *
     * @param <E>
     * @param map  map集合
     * @param key  键对
     * @param defaultValue 默认值
     * @return
     * @author jiqinlin
     */
    @SuppressWarnings({ "unchecked", "rawtypes" })
    public final static <E> E get(Map map, Object key, E defaultValue) {
        Object o = map.get(key);
        if (o == null)
            return defaultValue;
        return (E) o;
    }

    /**
     * Map集合对象转化成 JavaBean集合对象
     *
     * @param javaBean JavaBean实例对象
     * @param mapList Map数据集对象
     * @return
     * @author jqlin
     */
    @SuppressWarnings({ "rawtypes" })
    public static <T> List<T> map2Java(T javaBean, List<Map> mapList) {
        if(mapList == null || mapList.isEmpty()){
            return null;
        }
        List<T> objectList = new ArrayList<T>();

        T object = null;
        for(Map map : mapList){
            if(map != null){
                object = map2Java(javaBean, map);
                objectList.add(object);
            }
        }

        return objectList;

    }

    /**
     * Map对象转化成 JavaBean对象
     *
     * @param javaBean JavaBean实例对象
     * @param map Map对象
     * @return
     * @author jqlin
     */
    @SuppressWarnings({ "rawtypes","unchecked"})
    public static <T> T map2Java(T javaBean, Map map) {
        try {
            // 获取javaBean属性
            BeanInfo beanInfo = Introspector.getBeanInfo(javaBean.getClass());
            // 创建 JavaBean 对象
            Object obj = javaBean.getClass().newInstance();

            PropertyDescriptor[] propertyDescriptors = beanInfo.getPropertyDescriptors();
            if (propertyDescriptors != null && propertyDescriptors.length > 0) {
                String propertyName = null; // javaBean属性名
                Object propertyValue = null; // javaBean属性值
                for (PropertyDescriptor pd : propertyDescriptors) {
                    propertyName = pd.getName();
                    if (map.containsKey(propertyName)) {
                        propertyValue = map.get(propertyName);
                        pd.getWriteMethod().invoke(obj, new Object[] { propertyValue });
                    }
                }
                return (T) obj;
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        return null;
    }

    /**
     * JavaBean对象转化成Map对象
     *
     * @param javaBean
     * @return
     * @author jqlin
     */
    @SuppressWarnings({ "rawtypes", "unchecked" })
    public static Map java2Map(Object javaBean) {
        Map map = new HashMap();

        try {
            // 获取javaBean属性
            BeanInfo beanInfo = Introspector.getBeanInfo(javaBean.getClass());

            PropertyDescriptor[] propertyDescriptors = beanInfo.getPropertyDescriptors();
            if (propertyDescriptors != null && propertyDescriptors.length > 0) {
                String propertyName = null; // javaBean属性名
                Object propertyValue = null; // javaBean属性值
                for (PropertyDescriptor pd : propertyDescriptors) {
                    propertyName = pd.getName();
                    if (!propertyName.equals("class")) {
                        Method readMethod = pd.getReadMethod();
                        propertyValue = readMethod.invoke(javaBean, new Object[0]);
                        map.put(propertyName, propertyValue);
                    }
                }
            }

        } catch (Exception e) {
            e.printStackTrace();
        }

        return map;
    }

    /**
     *
     * map转str
     * @param map
     * @return
     */
    public static String Map2String(Map<String,String> map){
        Set<String> keySet = map.keySet();
        //将set集合转换为数组
        String[] keyArray = keySet.toArray(new String[keySet.size()]);
        //给数组排序(升序)
        Arrays.sort(keyArray);
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < keyArray.length; i++) {
            // 参数值为空，则不参与签名 这个方法trim()是去空格
            if (map.get(keyArray[i]).trim().length() > 0) {
                sb.append(keyArray[i]).append("=").append(map.get(keyArray[i]).trim());
            }
            if(i != keyArray.length-1){
                sb.append("&");
            }
        }
        return sb.toString();
    }

    /**
     * String转map
     * @param str
     * @return
     */
    public static Map<String,String> String2Map(String str){
        //判断str是否有值
        if(null == str || "".equals(str)){
            return null;
        }
        //根据&截取
        String[] strings = str.split("&");
        //设置HashMap长度
        int mapLength = strings.length;
        //判断hashMap的长度是否是2的幂。
        if((strings.length % 2) != 0){
            mapLength = mapLength+1;
        }

        Map<String,String> map = new HashMap<>(mapLength);
        //循环加入map集合
        for (int i = 0; i < strings.length; i++) {
            //截取一组字符串
            String[] strArray = strings[i].split("=");
            //strArray[0]为KEY  strArray[1]为值
            map.put(strArray[0],strArray[1]);
        }
        return map;
    }



}