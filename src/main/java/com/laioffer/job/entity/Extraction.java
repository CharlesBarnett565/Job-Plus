package com.laioffer.job.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public class Extraction {// 这个class定义什么是extraction类； 因为extraction response返回的结果是一个list of extractions;
    @JsonProperty("tag_name")//jackson annotation是负责本地到前端的mapping,annotation就是告诉前端本地变量tagName到前端就用tag_name表示
    //存在相应的json文件里;
    public String tagName;

    @JsonProperty("parsed_value")
    public String parsedValue;//这个parseValue就是monkeyLearn为你找到的疑似关键词;

    public int count;

    public String relevance;
}
