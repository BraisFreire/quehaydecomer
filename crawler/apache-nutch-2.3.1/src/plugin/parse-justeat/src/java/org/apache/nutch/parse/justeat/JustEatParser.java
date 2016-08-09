package org.apache.nutch.parse.justeat;

import java.io.ByteArrayOutputStream;
import java.io.DataOutputStream;
import java.net.URL;
import java.nio.ByteBuffer;
import java.util.*;

import org.apache.avro.util.Utf8;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.apache.hadoop.conf.Configuration;
import org.apache.nutch.parse.HTMLMetaTags;
import org.apache.nutch.parse.Parse;
import org.apache.nutch.parse.ParseFilter;
import org.apache.nutch.parse.ParseStatusUtils;
import org.apache.nutch.storage.WebPage;
import org.apache.nutch.storage.WebPage.Field;
import org.apache.nutch.util.NodeWalker;
import org.w3c.dom.DocumentFragment;
import org.w3c.dom.NamedNodeMap;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.w3c.dom.Element;

public class JustEatParser implements ParseFilter {


	private static final Log LOG = LogFactory.getLog(JustEatParser.class
			.getName());

	private Configuration conf;

	public static final String PARSE_META_PREFIX = "infoRestaurat_";

	public void setConf(Configuration conf) {
		this.conf = conf;

	}

	public Configuration getConf() {
		return this.conf;
	}
	
	@Override
	public Collection<Field> getFields() {
		return null;
	}

	public Parse filter(String url, WebPage page, Parse parse, HTMLMetaTags metaTags, DocumentFragment doc) {
		
		URL base;
		Map<String, List> restaurant;
		System.out.println("Filter: Comeza parseado");
		try {
			base = new URL(page.getBaseUrl().toString());
			
			restaurant = getRestaurant(page, doc);
	
			System.out.println("Rematado parseo de "+restaurant.get("name"));

			if(restaurant.get("name") != null){
				//System.out.println("pushing metadata");
				pushIntoMetadata(page, restaurant);	
			}else{
				System.out.println("Restaurant IS NULL");
			}

		} catch (Exception e) {
			LOG.error("Error parsing " + url, e);
			return ParseStatusUtils.getEmptyParse(e, getConf());
		}

		return parse;
	}

	public Map<String, List> getRestaurant(WebPage page, Node node) {

		NodeWalker walker = new NodeWalker(node);

		Map<String, List> restaurant = new HashMap<String, List>();

		System.out.println("getRestaurant: Comeza");
				
		List dishes = new ArrayList();
		List prizes = new ArrayList();

		while (walker.hasNext()) {
			Node currentNode = walker.nextNode();
			String nodeName = currentNode.getNodeName();
			short nodeType = currentNode.getNodeType();

			if (nodeType == Node.ELEMENT_NODE) {
				nodeName = nodeName.toLowerCase();

				// Parse restaurant
				if (nodeName.equals("h1")) {
					NamedNodeMap attrs = currentNode.getAttributes();
					try {
						Node attr_itemtype = attrs.getNamedItem("class");
						if ("infoTextBlock-item-title".equals(attr_itemtype.getNodeValue())) {

							
							
							NodeList childs = currentNode.getChildNodes();
							
							List list = new ArrayList();
							
							list.add(childs.item(0).getTextContent());

							restaurant.put("name", list);
							
						}

					} catch (Exception e) {
						
					}
				}

				if (nodeName.equals("p")){
					NamedNodeMap attrs = currentNode.getAttributes();
					
					try {
						Node attr_itemtype = attrs.getNamedItem("class");
						if ("restInfoAddress".equals(attr_itemtype.getNodeValue())) {

							NodeList childs = currentNode.getChildNodes();
							String address = childs.item(0).getTextContent().trim();
							address = address.replace("\n", "");
							address = address.trim();
							String city = childs.item(2).getTextContent().toString().trim();
							city=city.substring(0, city.indexOf(","));
							if (city.indexOf("Coruña")>-1){
							city="A Coruña";							
							}
							List list = new ArrayList();
							list.add(address);
							list.add(city);
							
							restaurant.put("address",list);
							
							
							
						}

						if ("infoTextBlock-item-text".equals(attr_itemtype.getNodeValue())) {

							NodeList childs = currentNode.getChildNodes();
							
							List list = new ArrayList();
							
							list.add(childs.item(0).getTextContent());
							
							
							restaurant.put("typeRest",list);
							
						}

					} catch (Exception e) {
						
					}
									
				
				}

				if (nodeName.equals("img")){
					NamedNodeMap attrs = currentNode.getAttributes();
					
					try{
						Node attr_itemtype = attrs.getNamedItem("class");
						if ("mediaElement-img mediaElement-img--outlined".equals(attr_itemtype.getNodeValue())) {
							Node attr_itemtype2 = attrs.getNamedItem("src");
							String urlImg = attr_itemtype2.getNodeValue();
							urlImg = "https:"+urlImg;
							
							List list = new ArrayList();
							list.add(urlImg);
							
							restaurant.put("imgUrl", list);
						}
					} catch (Exception e){
						
					}
				}
				
				
				if (nodeName.equals("h4")){
					NamedNodeMap attrs = currentNode.getAttributes();
					try{
						Node attr_itemtype = attrs.getNamedItem("class");
						if ("product-title".equals(attr_itemtype.getNodeValue())){
							NodeList childs = currentNode.getChildNodes();
							String dish=childs.item(0).getTextContent();
							dish = dish.replace("\n", "");
							dish = dish.replace(",", "");
							dish = dish.trim();
							dishes.add(dish);
						}
					} catch (Exception e){
						
					}
				}
				
				if (nodeName.equals("div")){
					NamedNodeMap attrs = currentNode.getAttributes();
					try{
						Node attr_itemtype = attrs.getNamedItem("class");
						if ("product-price u-noWrap".equals(attr_itemtype.getNodeValue())){
							NodeList childs = currentNode.getChildNodes();
							String prize=childs.item(0).getTextContent();
							prize=prize.replaceAll(",",".");
							prizes.add(prize);
							
						}
					} catch (Exception e){
						
					}
				}

			}
		}

        System.out.println(dishes.toString());
        System.out.println(prizes.toString());
		restaurant.put("dishes", dishes);
		restaurant.put("prizes", prizes);
		return restaurant;
	}

	public void pushIntoMetadata(WebPage page, Map<String, List> restaurant) throws Exception{
	
		List name = restaurant.get("name");
		List address = restaurant.get("address");
		List type = restaurant.get("typeRest");
		List url = restaurant.get("imgUrl");
		List dishes = restaurant.get("dishes");
		List prizes = restaurant.get("prizes");

//		System.out.println("Name of restaurant is "+name.get(0).toString());
//		
//		System.out.println("Address of restaurant is "+address.get(0).toString());
//		System.out.println("City of restaurant is "+address.get(1).toString());
//		
//		System.out.println("Type of restaurant is "+type.get(0).toString());
//		
//		System.out.println("Image of restaurant is in "+url.get(0).toString());
//		
//		
//		System.out.println("******************");
//		
//		System.out.println("******************");
	
		page.getMetadata().put("name", ByteBuffer.wrap(name.get(0).toString().getBytes()));
		page.getMetadata().put("address", ByteBuffer.wrap(address.get(0).toString().getBytes()));
		page.getMetadata().put("city", ByteBuffer.wrap(address.get(1).toString().getBytes()));
		page.getMetadata().put("typeRest", ByteBuffer.wrap(type.get(0).toString().getBytes()));
		page.getMetadata().put("imgUrl", ByteBuffer.wrap(url.get(0).toString().getBytes()));
		page.getMetadata().put("dishes", ByteBuffer.wrap(dishes.toString().getBytes()));
		page.getMetadata().put("prizes", ByteBuffer.wrap(prizes.toString().getBytes()));
	}

}
