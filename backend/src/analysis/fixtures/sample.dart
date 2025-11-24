
class TestClass {
  void method1() {}
  Future<void> asyncMethod() async {}
  String get getter => 'value';
}

void globalFunction() {}

void main() {
  test('test description', () {});
  group('group description', () {
    testWidgets('widget test', (tester) async {});
  });
}
