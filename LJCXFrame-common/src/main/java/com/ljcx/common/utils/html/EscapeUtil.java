package com.ljcx.common.utils.html;

import com.ljcx.common.utils.StringUtils;

/**
 * 转义和反转义工具类
 */
public class EscapeUtil {

    public static final String RE_HTML_MARK = "(<[^<]*?>)|(<[\\s]*?/[^<]*?>)|(<[^<]*?/[\\s]*?>)";

    private static final char[][] TEXT = new char[64][];

    static {
        for(int i = 0; i < 64; i++){
            TEXT[i] = new char[]{ (char)i };
        }

        TEXT['\''] = "&#039;".toCharArray(); //单引号
        TEXT['"'] = "&#34;".toCharArray(); //单引号
        TEXT['&'] = "&#38;".toCharArray(); //&符
        TEXT['<'] = "&#60;".toCharArray(); // 小于号
        TEXT['>'] = "&#62;".toCharArray(); // 大于号
    }

    /**
     * 转义文本中的HTML字符为安全字符
     * @param text
     * @return
     */
    public static String escape(String text){
        return encode(text);
    }

    /**
     * 还原被转义的HTML特殊字符
     * @param content
     * @return
     */
    public static String unescape(String content){return decode(content);}

    public static String clean(String content){
        return content.replaceAll(RE_HTML_MARK, "");
    }
    /**
     * Escape解码
     * @param content
     * @return
     */
    private static String decode(String content) {
        if(StringUtils.isEmpty(content)){
            return content;
        }

        StringBuilder tmp = new StringBuilder(content.length());
        int lastPos = 0, pos = 0;
        char ch;
        while (lastPos < content.length())
        {
            pos = content.indexOf("%", lastPos);
            if(pos == lastPos){
                if(content.charAt(pos + 1) == 'u'){
                    ch = (char) Integer.parseInt(content.substring(pos+2, pos+ 6), 16);
                    tmp.append(ch);
                    lastPos = pos + 6;
                }
                else
                {
                    ch = (char) Integer.parseInt(content.substring(pos + 1, pos + 3), 16);
                    tmp.append(ch);
                    lastPos = pos + 3;
                }
            }
            else
            {
                if(pos == -1)
                {
                    tmp.append(content.substring(lastPos));
                    lastPos = content.length();
                }
                else
                {
                    tmp.append(content.substring(lastPos, pos));
                    lastPos = pos;
                }
            }
        }

        return tmp.toString();

    }

    private static String encode(String text) {
        int len;
        if((text == null) || ((len = text.length()) == 0)){
            return StringUtils.EMPTY;
        }
        StringBuilder buffer = new StringBuilder(len + (len >> 2));
        char c;
        for(int i = 0; i< len; i++){
            c = text.charAt(i);
            if(c < 64){
                buffer.append(TEXT[c]);
            }
            else
            {
                buffer.append(c);
            }
        }

        return buffer.toString();
    }

}
