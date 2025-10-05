import { ILogger } from "@/core/application/interfaces/ilog.app.inter";
import { IVbdSplitterRepository } from "@/core/application/interfaces/vbd-splitter.inter";
import { FirebaseAdminProvider } from "../providers/firebase/firebase-admin";
import {
  TCreateVbdDto,
  TUpdateVbdDto,
  TVbdOutRequestDto,
} from "@/core/application/dtos/vbd.dto";

export class VbdSplitterRepository implements IVbdSplitterRepository {
  constructor(
    private readonly logger: ILogger,
    private readonly firebaseAdmin: FirebaseAdminProvider
  ) {}
  async create(data: TCreateVbdDto): Promise<string> {
    try {
      this.logger.info("VbdSplitterRepository: Creating VBD Splitter:", {
        ...data,
      });

      // Use Firebase Admin SDK to insert VBD Splitter
      const db = this.firebaseAdmin.db;
      const vbdDocRef = await db
        .collection(this.firebaseAdmin.coll.VBD_SPLITTERS)
        .add(data);

      await vbdDocRef.update({ id: vbdDocRef.id });

      this.logger.info("VbdSplitterRepository: Created VBD Splitter:", {
        id: vbdDocRef.id,
        ...data,
      });

      return vbdDocRef.id;
    } catch (error) {
      this.logger.error("VbdSplitterRepository: Error creating VBD Splitter:", {
        error: error.errorMessage || error.message || JSON.stringify(error),
      });
      throw new Error(
        "Error creating VBD Splitter: " + error.errorMessage ||
          error.message ||
          JSON.stringify(error)
      );
    }
  }
  async update(id: string, data: TUpdateVbdDto): Promise<void> {
    try {
      this.logger.info("VbdSplitterRepository: Updating VBD Splitter:", {
        id,
        ...data,
      });
      this.logger.info("VbdSplitterRepository: Update VBD Splitter:", {
        id,
        ...data,
      });

      // Use Firebase Admin SDK to update VBD Splitter
      const db = this.firebaseAdmin.db;
      await db
        .collection(this.firebaseAdmin.coll.VBD_SPLITTERS)
        .doc(id)
        .update(data);

      this.logger.info("VbdSplitterRepository: Updated VBD Splitter:");
    } catch (error) {
      this.logger.error("VbdSplitterRepository: Error updating VBD Splitter:", {
        error: error.errorMessage || error.message || JSON.stringify(error),
      });
      throw new Error(
        "Error updating VBD Splitter: " + error.errorMessage ||
          error.message ||
          JSON.stringify(error)
      );
    }
  }
  async delete(id: string): Promise<void> {
    try {
      this.logger.info("VbdSplitterRepository: Deleting VBD Splitter:", { id });
      // Use Firebase Admin SDK to delete VBD Splitter
      const db = this.firebaseAdmin.db;
      await db
        .collection(this.firebaseAdmin.coll.VBD_SPLITTERS)
        .doc(id)
        .delete();
      this.logger.info("VbdSplitterRepository: Deleted VBD Splitter:", { id });
    } catch (error) {
      this.logger.error("VbdSplitterRepository: Error deleting VBD Splitter:", {
        error: error.errorMessage || error.message || JSON.stringify(error),
      });
      throw new Error(
        "Error deleting VBD Splitter: " + error.errorMessage ||
          error.message ||
          JSON.stringify(error)
      );
    }
  }
  async findById(id: string): Promise<TVbdOutRequestDto | null> {
    try {
      // Use Firebase Admin SDK to fetch VBD Splitter by ID
      const db = this.firebaseAdmin.db;
      const vbdDoc = await db
        .collection(this.firebaseAdmin.coll.VBD_SPLITTERS)
        .doc(id)
        .get();
      if (!vbdDoc.exists) {
        return null;
      }
      return {
        id: vbdDoc.id,
        ...vbdDoc.data(),
      } as TVbdOutRequestDto;
    } catch (error) {
      this.logger.error(
        "VbdSplitterRepository: Error finding VBD Splitter by ID:",
        {
          error: error.errorMessage || error.message || JSON.stringify(error),
        }
      );
      throw new Error(
        "Error finding VBD Splitter by ID: " + error.errorMessage ||
          error.message ||
          JSON.stringify(error)
      );
    }
  }
  async findAll(): Promise<TVbdOutRequestDto[]> {
    try {
      const snapshot = await this.firebaseAdmin.db
        .collection(this.firebaseAdmin.coll.VBD_SPLITTERS)
        .get();
      const vbdSplitters: TVbdOutRequestDto[] = [];
      snapshot.forEach((doc) => {
        vbdSplitters.push({
          id: doc.id,
          ...doc.data(),
        } as TVbdOutRequestDto);
      });
      return vbdSplitters;
    } catch (error) {
      this.logger.error(
        "VbdSplitterRepository: Error finding all VBD Splitters:",
        {
          error: error.errorMessage || error.message || JSON.stringify(error),
        }
      );
      throw new Error(
        "Error finding all VBD Splitters: " + error.errorMessage ||
          error.message ||
          JSON.stringify(error)
      );
    }
  }
  async findByName(name: string): Promise<TVbdOutRequestDto | null> {
    try {
      const snapshot = await this.firebaseAdmin.db
        .collection(this.firebaseAdmin.coll.VBD_SPLITTERS)
        .where("name", "==", name)
        .get();
      if (snapshot.empty) {
        return null;
      }
      const vbdDoc = snapshot.docs[0];
      return {
        id: vbdDoc.id,
        ...vbdDoc.data(),
      } as TVbdOutRequestDto;
    } catch (error) {
      this.logger.error(
        "VbdSplitterRepository: Error finding VBD Splitter by name:",
        {
          error: error.errorMessage || error.message || JSON.stringify(error),
        }
      );
      throw new Error(
        "Error finding VBD Splitter by name: " + error.errorMessage ||
          error.message ||
          JSON.stringify(error)
      );
    }
  }
}
