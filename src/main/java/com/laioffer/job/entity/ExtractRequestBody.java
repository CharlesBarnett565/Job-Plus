package com.laioffer.job.entity;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public class ExtractRequestBody {// MonkeyLearn api request class
    public List<String> data;

    @JsonProperty("max_keywords")//jasonProperty是jackson library的api就告诉你自己定义的maxKeywords对应api call里面的max_keywords api;
    public int maxKeywords;

    public ExtractRequestBody(List<String> data, int maxKeywords) {
        this.data = data;
        this.maxKeywords = maxKeywords;
    }
}
