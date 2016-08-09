package org.apache.nutch.indexer.justeat;

import java.io.ByteArrayInputStream;
import java.io.DataInputStream;
import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.nio.ByteBuffer;
import java.sql.Date;
import java.util.Collection;
import java.util.Iterator;
import java.util.Map.Entry;

import org.apache.avro.util.Utf8;
import org.apache.hadoop.conf.Configuration;
import org.apache.nutch.indexer.IndexingException;
import org.apache.nutch.indexer.IndexingFilter;
import org.apache.nutch.indexer.NutchDocument;
import org.apache.nutch.storage.WebPage;
import org.apache.nutch.storage.WebPage.Field;
import org.apache.solr.common.util.DateUtil;

public class JustEatIndexer implements IndexingFilter {

	private Configuration conf;

	public NutchDocument filter(NutchDocument doc, String url, WebPage page)
			throws IndexingException {

		if (doc == null)
			return doc;


		Iterator entries = page.getMetadata().entrySet().iterator();
		while (entries.hasNext()) {
			Entry thisEntry = (Entry) entries.next();
			Object key = thisEntry.getKey();
			ByteBuffer value = (ByteBuffer) thisEntry.getValue();

			try {
				if (key.toString().equals("name") || key.toString().equals("address") ||  key.toString().equals("city") || key.toString().equals("typeRest") || key.toString().equals("imgUrl") || key.toString().equals("dishes") || key.toString().equals("prizes")) {
					
					doc.add(key.toString(), new String(value.array(), "UTF-8").toString());
				}

			} catch (UnsupportedEncodingException e) {
				e.printStackTrace();
			} 
		}

		return doc;

	}

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
}
