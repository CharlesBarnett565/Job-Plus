package com.laioffer.job.recommendation;

import com.laioffer.job.db.MySQLConnection;
import com.laioffer.job.entity.Item;
import com.laioffer.job.external.GitHubClient;

import java.util.*;

public class Recommendation {
    public List<Item> recommendItems(String userId, double lat, double lon) {
        List<Item> recommendedItems = new ArrayList<>();

        // Step 1, get all favorited itemids//创建mysqL connection
        MySQLConnection connection = new MySQLConnection();
        Set<String> favoritedItemIds = connection.getFavoriteItemIds(userId);//通过userId找到所有的favoriteItemid

        // Step 2, get all keywords, sort by count
        // {"software engineer": 6, "backend": 4, "san francisco": 3, "remote": 1}
        Map<String, Integer> allKeywords = new HashMap<>();
        for (String itemId : favoritedItemIds) {
            Set<String> keywords = connection.getKeywords(itemId);//通过这些favorite itemId得到这些item的keyword;
            for (String keyword : keywords) {
                allKeywords.put(keyword, allKeywords.getOrDefault(keyword, 0) + 1);
            }//上一句就表示如果原来没有的话就默认0然后数目加1，如果原来有的话就把原来的个数加1；
        }
        connection.close();

        List<Map.Entry<String, Integer>> keywordList = new ArrayList<>(allKeywords.entrySet());
//        keywordList.sort((Map.Entry<String, Integer> e1, Map.Entry<String, Integer> e2) ->
//                Integer.compare(e2.getValue(), e1.getValue()));
        keywordList.sort(new Comparator<Map.Entry<String, Integer>>(){
            @Override
            public int compare(Map.Entry<String, Integer>e1, Map.Entry<String, Integer>e2){
                return Integer.compare(e2.getValue(), e1.getValue());
            }
        });

        // Cut down search list only top 3
        if (keywordList.size() > 3) {
            keywordList = keywordList.subList(0, 3);
        }//这里是选取前三个最多的item;用了一个comparator;

        // Step 3, search based on keywords, filter out favorite items
        Set<String> visitedItemIds = new HashSet<>();
        GitHubClient client = new GitHubClient();//在gitHubClient class里面创建一个新的对象;

        for (Map.Entry<String, Integer> keyword : keywordList) {//通过经纬度和keyword来找到相应的工作;
            List<Item> items = client.search(lat, lon, keyword.getKey());

            for (Item item : items) {
                if (!favoritedItemIds.contains(item.getId()) && !visitedItemIds.contains(item.getId())) {
                    recommendedItems.add(item);//这一步很关键，找到相应工作后要去重：
                    //1:新找到的这些工作是不是已经在用户的favoriteItem list里面了；
                    //2:新找到的这些工作是不是在这一轮已经找到过一遍了，如果满足以上两个条件，就不加入结果；
                    visitedItemIds.add(item.getId());//这里是每一次找到一个新的item就加进visiteditem hashset去重;
                }
            }
        }
        return recommendedItems;
    }
}
