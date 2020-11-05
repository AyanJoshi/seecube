import java.util.*;
public class Script
{
	public static void main(String[] args) {
		Scanner scan = new Scanner(System.in);
        boolean encounterless = true;
        boolean encountermore = true;
        while(scan.hasNext()) {
            String a = scan.nextLine();
            if(a.charAt(0)=='<' && encounterless) {
                System.out.println("Expected:"+a.split("<")[1]);
                encounterless = false;
            }
            else if(a.charAt(0)=='>' && encountermore) {
                System.out.println("Your Output:"+a.split(">")[1]);
                encountermore = false;
            }
        }
			
	}
}



