// src/neo4j/neo4j.service.ts
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import * as neo4j from 'neo4j-driver';

@Injectable()
export class Neo4jService implements OnModuleInit, OnModuleDestroy {
  private driver: neo4j.Driver;

  constructor() {
    this.driver = neo4j.driver(
      process.env.NEO4J_URI || '',
      neo4j.auth.basic(
        process.env.NEO4J_USER || '',
        process.env.NEO4J_PASSWORD || '',
      ),
      {
        disableLosslessIntegers: true, // Recommended to handle integers properly
      },
    );
  }

  async onModuleInit() {
    await this.driver.verifyConnectivity();
    console.log('Neo4j connection established');
  }

  async onModuleDestroy() {
    await this.driver.close();
  }

  getReadSession(): neo4j.Session {
    return this.driver.session({
      database: process.env.NEO4J_DATABASE || 'neo4j',
      defaultAccessMode: neo4j.session.READ,
    });
  }

  getSession(options?: { database?: string; accessMode?: any }) {
    return this.driver.session({
      database: process.env.NEO4J_DATABASE || 'neo4j',
      ...options,
    });
  }

  async read(cypher: string, params?: Record<string, any>) {
    const session = this.getReadSession();
    try {
      const result = await session.run(cypher, params);
      return result.records.map((record) => record.toObject());
    } finally {
      await session.close();
    }
  }
}
