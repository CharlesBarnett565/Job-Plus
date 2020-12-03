package com.laioffer.job.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)//这个不能省略，因为我们只用了一部分的field而不是全部的;
public class ExtractResponseItem {// this is the keyWord extraction response result class;
    public List<Extraction> extractions;
}
