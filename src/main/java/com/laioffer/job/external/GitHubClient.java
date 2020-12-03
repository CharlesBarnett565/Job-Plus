package com.laioffer.job.external;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.laioffer.job.entity.Item;
import org.apache.http.HttpEntity;
import org.apache.http.client.ResponseHandler;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.util.EntityUtils;

import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.util.*;

public class GitHubClient {//这个GithubClient负责和github server外部通信，拿到job数据
    private static final String URL_TEMPLATE = "https://jobs.github.com/positions.json?description=%s&lat=%s&long=%s";
    private static final String DEFAULT_KEYWORD = "developer";//这两个是要发出去的request;

    public List<Item> search(double lat, double lon, String keyword){
        if (keyword == null) {
            keyword = DEFAULT_KEYWORD;
        }


        // “hello world” => “hello%20world”//这一步是要转换格式;把空格转换成了%20，就是把日常String转换成URL可以接受的格式;
        try {
            keyword = URLEncoder.encode(keyword, "UTF-8");
        } catch (UnsupportedEncodingException e) {
            e.printStackTrace();
        }
        String url = String.format(URL_TEMPLATE, keyword, lat, lon);

        CloseableHttpClient httpclient = HttpClients.createDefault();// apache httpClient来给github server发这个请求

        // Create a custom response handler,这一步是在54行之后执行的;这里只是创建了一个method(anonmose class),不一定按顺序执行;
        ResponseHandler<List<Item>> responseHandler = response -> {//responseHandler来处理response;
            //这里是一个lambda expression,response相当于一个输入，当response来了以后responseHandler就来处理
            // response满足括号中的条件返回相应类型的结果;
            if (response.getStatusLine().getStatusCode() != 200) {
                return Collections.emptyList();
            }
            HttpEntity entity = response.getEntity();
            if (entity == null) {
                return Collections.emptyList();
            }

            ObjectMapper mapper = new ObjectMapper();//mapper这里是做映射用的，把Jason映射成一个object(array,arraylist);

//            Item[] itemArray = mapper.readValue(entity.getContent(), Item[].class);
//            //这里就是mapper自带的一个api,把entity.getContent()这里返回的Jason格式的response map成一个Item class里面的一个Item[](Item array对象);
//            //return itemArray;
//            return Arrays.asList(itemArray);
            
            List<Item> items = Arrays.asList(mapper.readValue(entity.getContent(), Item[].class));
            extractKeywords(items);
            return items;
        };

        try {//这一步是先执行的，因为先要execute得到结果了，才能知道responseHandler的status code是不是200;
            return httpclient.execute(new HttpGet(url), responseHandler);
        } catch (IOException e) {
            e.printStackTrace();
        }
        return Collections.emptyList();
    }

    private void extractKeywords(List<Item> items) {//这里拿到已经转化成List<Item>的items以后把其中每一个Item的description
        //装进一个List<String> descriptions里面去，并且把这个当作moneyLearn library的input,通过monkeyLearn得到description的关键词;

        MonkeyLearnClient monkeyLearnClient = new MonkeyLearnClient();//创建monkeyLearn client;

        List<String> descriptions = new ArrayList<>();
        for (Item item : items) {
            descriptions.add(item.getDescription());//item.getDescription()调用了gitHub api的description();
            //拿到了工作描述;
        }

        List<Set<String>> keywordList = monkeyLearnClient.extract(descriptions);//

        for (int i = 0; i < items.size(); i++) {
            items.get(i).setKeywords(keywordList.get(i));//List<Item>的setKeywords method 输入是一个Set<String> keywords
            //而keywordList是一个List<Set<String>>;keywordList.get(i)就是Set<String>;
            //这里是给Item Class 里面的 Set<String> keyWords这个field赋值;
        }
    }


}
