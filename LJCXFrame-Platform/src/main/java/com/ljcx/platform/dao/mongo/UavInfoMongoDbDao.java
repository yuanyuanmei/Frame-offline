package com.ljcx.platform.dao.mongo;

import com.ljcx.common.base.MongoDbDao;
import com.ljcx.platform.beans.mongo.UavInfoMongo;
import org.springframework.stereotype.Repository;

@Repository
public class UavInfoMongoDbDao extends MongoDbDao<UavInfoMongo> {
    @Override
    protected Class<UavInfoMongo> getEntityClass() {
        return UavInfoMongo.class;
    }


}
