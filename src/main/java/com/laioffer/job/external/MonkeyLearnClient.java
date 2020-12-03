package com.laioffer.job.external;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.laioffer.job.entity.ExtractRequestBody;
import com.laioffer.job.entity.ExtractResponseItem;
import com.laioffer.job.entity.Extraction;
import org.apache.http.HttpEntity;
import org.apache.http.client.ResponseHandler;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;

import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.util.*;

public class MonkeyLearnClient {//monkeylearn是一个library用来对给定输入搜索关键词keyWord;
    private static final String EXTRACT_URL = "https://api.monkeylearn.com/v3/extractors/ex_YCya9nrn/extract/";
    private static final String AUTH_TOKEN = "8c1a023f33c67441c08ca83e5bf91b2c7f3eaf10";

    public List<Set<String>> extract(List<String> articles) {
        ObjectMapper mapper = new ObjectMapper();
        CloseableHttpClient httpClient = HttpClients.createDefault();

        HttpPost request = new HttpPost(EXTRACT_URL);
        request.setHeader("Content-type", "application/json");
        request.setHeader("Authorization", "Token " + AUTH_TOKEN);//把我们的token key提供给server;
        ExtractRequestBody body = new ExtractRequestBody(articles, 3);//得到request json body;

        String jsonBody;
        try {
            jsonBody = mapper.writeValueAsString(body);//把得到的json body 写成string 形式;
        } catch (JsonProcessingException e) {
            return Collections.emptyList();
        }

        try {
            request.setEntity(new StringEntity(jsonBody));//把entity想成具体的内容;
        } catch (UnsupportedEncodingException e) {
            return Collections.emptyList();
        }

        ResponseHandler<List<Set<String>>> responseHandler = response -> {//这里就是要把response转换成list<Set<String>>;
            //responseHandler来处理response;
            //这里是一个lambda expression,response相当于一个输入，当response来了以后responseHandler就来处理
            if (response.getStatusLine().getStatusCode() != 200) {
                return Collections.emptyList();
            }
            HttpEntity entity = response.getEntity();//得到response的结果内容;
            if (entity == null) {
                return Collections.emptyList();
            }
            ExtractResponseItem[] results = mapper.readValue(entity.getContent(), ExtractResponseItem[].class);//
            //这里就是mapper自带的一个api,把entity.getContent()这里返回的Jason格式的response map成一个ExtractResponseItem class里面的一个ExtractResponseItem[](ExtractResponseItem array对象);
            List<Set<String>> keywordList = new ArrayList<>();

            for (ExtractResponseItem result : results) {//result类型是ExtractResponseItem;results是ExtractionResponseItem的array[];
                Set<String> keywords = new HashSet<>();
                for (Extraction extraction : result.extractions) {//result里面的一个field是名叫extractions的List<Extraction>;
                    keywords.add(extraction.parsedValue);//extraction.parsedValue是一个string;对应monkeyLearn为你找到的关键词;
                }
                keywordList.add(keywords);
            }
            return keywordList;
        };

        try {//这里一定要try catch是因为excute function里面就由throw;
            return httpClient.execute(request, responseHandler);//这里和gitHubClient一样，来执行request;
        } catch (IOException e) {
            e.printStackTrace();
        }
        return Collections.emptyList();
    }

    //这里是本地测试代码;
    public static void main(String[] args) {

        List<String> articles = Arrays.asList(
                "Elon Musk has shared a photo of the spacesuit designed by SpaceX. This is the second image shared of the new design and the first to feature the spacesuit’s full-body look.",
                "Former Auburn University football coach Tommy Tuberville defeated ex-US Attorney General Jeff Sessions in Tuesday nights runoff for the Republican nomination for the U.S. Senate. ",
                "The NEOWISE comet has been delighting skygazers around the world this month – with photographers turning their lenses upward and capturing it above landmarks across the Northern Hemisphere."
        );

        MonkeyLearnClient client = new MonkeyLearnClient();

        List<Set<String>> keywordList = client.extract(articles);
        System.out.println(keywordList);
    }
}
