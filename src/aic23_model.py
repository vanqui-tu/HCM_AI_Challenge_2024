from utils import clean_dbs, get_all_feats
from vector_database import TextEmbedding, VectorDB
from framedoc import FrameDoc, FrameDocs, get_all_docs, get_all_docs_v2
from docarray import DocList
from const import *
import time

print("Loading model...")
clean_dbs()
all_feat_files = get_all_feats(feat=FEATURE_PATH)
doc_list = get_all_docs(all_feat_files)
# doc_list = get_all_docs_v2()
print("Done...")


class AIC23_Model:
    def __init__(
        self,
        space="l2",
        max_elements=1024,
        ef_construction=400,
        ef=80,
        M=64,
        allow_replace_deleted=False,
        num_threads=-1,
        method="ANN",
    ) -> None:
        print("Index root database...")
        self.root = VectorDB(
            space=space,
            max_elements=max_elements,
            ef_construction=ef_construction,
            ef=ef,
            M=M,
            allow_replace_deleted=allow_replace_deleted,
            num_threads=num_threads,
            method=method,
            workspace=ROOT_DB,
        )
        self.root.index(doc_list)
        print("Done")

    def search(self, query_text: str, audio_texts=None, topk=1000) -> FrameDocs:
        return self.root.search(query_text=query_text, topk=topk).contains(
            keywords=audio_texts
        )

    def search_and_visualize(
        self, query_text: str, audio_texts=None, topk=1000
    ) -> FrameDocs:
        frameDocs = self.search(
            query_text=query_text, audio_texts=audio_texts, topk=topk
        )
        frameDocs.visualize()
        return frameDocs

    def search_in_sequence(
        self,
        query_text_1: str,
        query_text_2: str,
        strict_order=False,
        audio_texts=None,
        topk=1000,
    ) -> FrameDocs:
        frameDocs_1 = self.search(
            query_text=query_text_1, audio_texts=audio_texts, topk=topk
        )
        frameDocs_2 = self.search(
            query_text=query_text_2, audio_texts=audio_texts, topk=topk
        )

        results = []
        for idx1, frame1 in enumerate(frameDocs_1.doc_list):
            for idx2, frame2 in enumerate(frameDocs_2.doc_list):
                if (
                    frame1.video_name == frame2.video_name
                    and abs(frame1.actual_time - frame2.actual_time) < 20.0
                ):
                    if frame1.actual_time < frame2.actual_time:
                        results.append((idx1 + idx2, frame1, frame2))
                    elif strict_order == False:
                        results.append((idx1 + idx2, frame2, frame1))
        results.sort(key=lambda a: a[0])

        results_ = []
        for res in results:
            results_.append(res[1])
            results_.append(res[2])
        frameDocs = FrameDocs(results_)

        return frameDocs

    def search_in_sequence_and_visualize(
        self,
        query_text_1: str,
        query_text_2: str,
        strict_order=False,
        audio_texts=None,
        topk=1000,
    ) -> FrameDocs:
        frameDocs = self.search_in_sequence(
            query_text_1=query_text_1,
            query_text_2=query_text_2,
            strict_order=strict_order,
            audio_texts=audio_texts,
            topk=topk,
        )
        frameDocs.visualize()
        return frameDocs

    # def create_temp_db(self, audio_texts=None, new_doc_list=None):
    #     start = time.time()

    #     self.temp = VectorDB(
    #         space="l2",
    #         max_elements=1024,
    #         ef_construction=16,
    #         ef=100,
    #         M=128,
    #         allow_replace_deleted=False,
    #         num_threads=-1,
    #         method="ANN",
    #     )

    #     print("Index temporary database...")
    #     if new_doc_list == None and audio_texts != None:
    #         start2 = time.time()
    #         new_doc_list = doc_list.contains(keywords=audio_texts)
    #         end2 = time.time()
    #         print(
    #             f"Filter text: {round(((end2 - start2) / 60))}m {round((int(end2 - start2) % 60))}s"
    #         )
    #     print(f"Temporary database size: {len(new_doc_list)}")
    #     self.temp.index(new_doc_list)
    #     end = time.time()
    #     print(f"Done: {round(((end - start) / 60))}m {round((int(end - start) % 60))}s")

    # def search_temp_and_visualize(
    #     self, query_text: str, audio_texts=None, topk=1000
    # ) -> FrameDocs:
    #     frameDocs = self.temp.search(query_text=query_text, topk=topk).contains(
    #         keywords=audio_texts
    #     )
    #     frameDocs.visualize()
    #     return frameDocs

    # def filter_audio_and_search(
    #     self, query_text: str, audio_texts=None, topk=1000
    # ) -> FrameDocs:
    #     self.create_temp_db(audio_texts=audio_texts)
    #     return self.temp.search(query_text=query_text, topk=topk)


model = AIC23_Model()
print("Loading model: Done!")
