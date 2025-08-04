import { CosmosClient, Database, Container, ItemResponse } from '@azure/cosmos';
import { CosmosDbConfig } from '@/types/healthcare.types';
import { getCurrentEnvironment } from '@/config/environments';

export class CosmosDbClient {
  private client: CosmosClient;
  private database: Database;
  private container: Container;
  private config: CosmosDbConfig;

  constructor(config?: CosmosDbConfig) {
    const environment = getCurrentEnvironment();
    
    this.config = config || {
      endpoint: environment.database.cosmosDb.endpoint,
      key: process.env.COSMOS_DB_KEY || '',
      database: environment.database.cosmosDb.database,
      container: environment.database.cosmosDb.container
    };

    this.client = new CosmosClient({
      endpoint: this.config.endpoint,
      key: this.config.key
    });

    this.database = this.client.database(this.config.database);
    this.container = this.database.container(this.config.container);
  }

  /**
   * Initialize database and container if they don't exist
   */
  async initialize(): Promise<void> {
    try {
      // Create database if it doesn't exist
      await this.client.databases.createIfNotExists({
        id: this.config.database
      });

      // Create container if it doesn't exist
      await this.database.containers.createIfNotExists({
        id: this.config.container,
        partitionKey: '/id'
      });

      console.log(`[CosmosDB] Initialized database: ${this.config.database}, container: ${this.config.container}`);
    } catch (error) {
      console.error('[CosmosDB] Initialization failed:', error);
      throw error;
    }
  }

  /**
   * Create a new document
   */
  async createDocument<T>(document: T): Promise<ItemResponse<T>> {
    try {
      const response = await this.container.items.create(document);
      console.log(`[CosmosDB] Created document with id: ${response.resource?.id}`);
      return response;
    } catch (error) {
      console.error('[CosmosDB] Create document failed:', error);
      throw error;
    }
  }

  /**
   * Read a document by ID
   */
  async readDocument<T>(id: string, partitionKey?: string): Promise<ItemResponse<T>> {
    try {
      const response = await this.container.item(id, partitionKey || id).read<T>();
      console.log(`[CosmosDB] Read document with id: ${id}`);
      return response;
    } catch (error) {
      console.error(`[CosmosDB] Read document failed for id: ${id}`, error);
      throw error;
    }
  }

  /**
   * Update a document
   */
  async updateDocument<T>(id: string, document: T, partitionKey?: string): Promise<ItemResponse<T>> {
    try {
      const response = await this.container.item(id, partitionKey || id).replace(document);
      console.log(`[CosmosDB] Updated document with id: ${id}`);
      return response;
    } catch (error) {
      console.error(`[CosmosDB] Update document failed for id: ${id}`, error);
      throw error;
    }
  }

  /**
   * Delete a document
   */
  async deleteDocument(id: string, partitionKey?: string): Promise<ItemResponse<any>> {
    try {
      const response = await this.container.item(id, partitionKey || id).delete();
      console.log(`[CosmosDB] Deleted document with id: ${id}`);
      return response;
    } catch (error) {
      console.error(`[CosmosDB] Delete document failed for id: ${id}`, error);
      throw error;
    }
  }

  /**
   * Query documents
   */
  async queryDocuments<T>(query: string, parameters?: any[]): Promise<T[]> {
    try {
      const querySpec = {
        query: query,
        parameters: parameters || []
      };

      const { resources } = await this.container.items.query<T>(querySpec).fetchAll();
      console.log(`[CosmosDB] Query returned ${resources.length} documents`);
      return resources;
    } catch (error) {
      console.error('[CosmosDB] Query failed:', error);
      throw error;
    }
  }

  /**
   * Healthcare-specific methods
   */

  /**
   * Get member by ID
   */
  async getMember(memberId: string): Promise<any> {
    const query = 'SELECT * FROM c WHERE c.type = "member" AND c.memberId = @memberId';
    const parameters = [{ name: '@memberId', value: memberId }];
    
    const results = await this.queryDocuments(query, parameters);
    return results.length > 0 ? results[0] : null;
  }

  /**
   * Get claims for member
   */
  async getClaimsForMember(memberId: string): Promise<any[]> {
    const query = 'SELECT * FROM c WHERE c.type = "claim" AND c.memberId = @memberId ORDER BY c.serviceDate DESC';
    const parameters = [{ name: '@memberId', value: memberId }];
    
    return await this.queryDocuments(query, parameters);
  }

  /**
   * Get payments for member
   */
  async getPaymentsForMember(memberId: string): Promise<any[]> {
    const query = 'SELECT * FROM c WHERE c.type = "payment" AND c.memberId = @memberId ORDER BY c.paymentDate DESC';
    const parameters = [{ name: '@memberId', value: memberId }];
    
    return await this.queryDocuments(query, parameters);
  }

  /**
   * Get provider by ID
   */
  async getProvider(providerId: string): Promise<any> {
    const query = 'SELECT * FROM c WHERE c.type = "provider" AND c.providerId = @providerId';
    const parameters = [{ name: '@providerId', value: providerId }];
    
    const results = await this.queryDocuments(query, parameters);
    return results.length > 0 ? results[0] : null;
  }

  /**
   * Get active insurance plans
   */
  async getActivePlans(): Promise<any[]> {
    const query = 'SELECT * FROM c WHERE c.type = "plan" AND c.isActive = true';
    
    return await this.queryDocuments(query);
  }

  /**
   * Create test member
   */
  async createTestMember(memberData: any): Promise<any> {
    const member = {
      id: memberData.memberId,
      type: 'member',
      ...memberData,
      createdAt: new Date().toISOString(),
      isTestData: true
    };

    const response = await this.createDocument(member);
    return response.resource;
  }

  /**
   * Create test claim
   */
  async createTestClaim(claimData: any): Promise<any> {
    const claim = {
      id: claimData.claimId,
      type: 'claim',
      ...claimData,
      createdAt: new Date().toISOString(),
      isTestData: true
    };

    const response = await this.createDocument(claim);
    return response.resource;
  }

  /**
   * Create test payment
   */
  async createTestPayment(paymentData: any): Promise<any> {
    const payment = {
      id: paymentData.paymentId,
      type: 'payment',
      ...paymentData,
      createdAt: new Date().toISOString(),
      isTestData: true
    };

    const response = await this.createDocument(payment);
    return response.resource;
  }

  /**
   * Clean up test data
   */
  async cleanupTestData(): Promise<void> {
    try {
      const query = 'SELECT c.id FROM c WHERE c.isTestData = true';
      const testDocuments = await this.queryDocuments(query);

      console.log(`[CosmosDB] Cleaning up ${testDocuments.length} test documents`);

      for (const doc of testDocuments) {
        await this.deleteDocument(doc.id);
      }

      console.log('[CosmosDB] Test data cleanup completed');
    } catch (error) {
      console.error('[CosmosDB] Test data cleanup failed:', error);
      throw error;
    }
  }

  /**
   * Bulk insert documents
   */
  async bulkInsert<T>(documents: T[]): Promise<void> {
    try {
      console.log(`[CosmosDB] Bulk inserting ${documents.length} documents`);

      const promises = documents.map(doc => this.createDocument(doc));
      await Promise.all(promises);

      console.log('[CosmosDB] Bulk insert completed');
    } catch (error) {
      console.error('[CosmosDB] Bulk insert failed:', error);
      throw error;
    }
  }

  /**
   * Get document count
   */
  async getDocumentCount(documentType?: string): Promise<number> {
    try {
      let query = 'SELECT VALUE COUNT(1) FROM c';
      const parameters: any[] = [];

      if (documentType) {
        query += ' WHERE c.type = @type';
        parameters.push({ name: '@type', value: documentType });
      }

      const results = await this.queryDocuments<number>(query, parameters);
      return results[0] || 0;
    } catch (error) {
      console.error('[CosmosDB] Get document count failed:', error);
      throw error;
    }
  }

  /**
   * Check if document exists
   */
  async documentExists(id: string, partitionKey?: string): Promise<boolean> {
    try {
      await this.readDocument(id, partitionKey);
      return true;
    } catch (error: any) {
      if (error.code === 404) {
        return false;
      }
      throw error;
    }
  }

  /**
   * Get database statistics
   */
  async getDatabaseStats(): Promise<any> {
    try {
      const memberCount = await this.getDocumentCount('member');
      const claimCount = await this.getDocumentCount('claim');
      const paymentCount = await this.getDocumentCount('payment');
      const providerCount = await this.getDocumentCount('provider');
      const planCount = await this.getDocumentCount('plan');

      return {
        members: memberCount,
        claims: claimCount,
        payments: paymentCount,
        providers: providerCount,
        plans: planCount,
        total: memberCount + claimCount + paymentCount + providerCount + planCount
      };
    } catch (error) {
      console.error('[CosmosDB] Get database stats failed:', error);
      throw error;
    }
  }

  /**
   * Close connection
   */
  dispose(): void {
    // CosmosDB client doesn't require explicit disposal
    console.log('[CosmosDB] Connection disposed');
  }

  /**
   * Get client configuration
   */
  getConfig(): CosmosDbConfig {
    return { ...this.config };
  }

  /**
   * Test connection
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.database.read();
      console.log('[CosmosDB] Connection test successful');
      return true;
    } catch (error) {
      console.error('[CosmosDB] Connection test failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const cosmosDbClient = new CosmosDbClient();